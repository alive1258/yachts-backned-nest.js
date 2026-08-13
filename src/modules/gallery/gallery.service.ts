import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { GalleryItem } from './entities/gallery-item.entity';
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto';
import { UpdateGalleryItemDto } from './dto/update-gallery-item.dto';
import { GetGalleryItemDto } from './dto/get-gallery-item.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { DataQueryService } from 'src/common/data-query/data-query.service';
import { FileUploadsService } from 'src/common/file-uploads/file-uploads.service';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(GalleryItem)
    private readonly galleryRepository: Repository<GalleryItem>,
    private readonly fileUploadsService: FileUploadsService,
    private readonly dataQueryService: DataQueryService,
  ) {}

  /**
   * Delete every image of a gallery item from storage. Failures are logged,
   * not thrown — a missing/already-gone remote file shouldn't block the
   * database write that's happening alongside it.
   */
  private async deleteImages(images?: string[]): Promise<void> {
    if (!images || images.length === 0) return;

    await Promise.all(
      images.map(async (image) => {
        try {
          await this.fileUploadsService.deleteFileUploads(image);
        } catch (err) {
          if (err instanceof Error) {
            console.warn(`Failed to delete gallery image: ${err.message}`);
          } else {
            console.warn('Failed to delete gallery image:', err);
          }
        }
      }),
    );
  }

  /**
   * Create a new gallery item
   */
  async create(
    req: Request,
    createGalleryItemDto: CreateGalleryItemDto,
    files?: Express.Multer.File[],
  ): Promise<GalleryItem> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    let images: string[] | undefined;
    if (files && files.length > 0) {
      const uploaded = await this.fileUploadsService.fileUploads(files);
      images = Array.isArray(uploaded) ? uploaded : [uploaded];
    }

    const newGalleryItem = this.galleryRepository.create({
      ...createGalleryItemDto,
      added_by: String(userId),
      images,
    });

    return this.galleryRepository.save(newGalleryItem);
  }

  /**
   * Get all gallery items with optional filters/pagination
   */
  async findAll(
    query: GetGalleryItemDto,
  ): Promise<IPagination<Partial<GalleryItem>>> {
    return this.dataQueryService.execute<Partial<GalleryItem>>({
      repository: this.galleryRepository,
      alias: 'galleryItem',
      pagination: query,
      searchableFields: ['title', 'description'],
      filterableFields: ['position', 'is_active'],
      relations: ['addedBy'],
      select: [
        'id',
        'title',
        'description',
        'images',
        'position',
        'is_active',
        'created_at',
        'updated_at',
      ],
      selectRelations: ['addedBy.id', 'addedBy.name', 'addedBy.email'],
    });
  }

  /**
   * Get all active gallery items, ordered for the public homepage
   */
  async findActive(): Promise<GalleryItem[]> {
    return this.galleryRepository.find({
      where: { is_active: true },
      order: { position: 'ASC' },
    });
  }

  /**
   * Get a single gallery item by UUID
   */
  async findOne(id: string): Promise<GalleryItem> {
    const galleryItem = await this.galleryRepository.findOne({
      where: { id },
      relations: ['addedBy'],
    });

    if (!galleryItem) throw new NotFoundException('Gallery item not found.');

    return galleryItem;
  }

  /**
   * Update a gallery item. Newly uploaded files replace the entire image
   * set (old images are deleted from storage first) — the same
   * "new file swaps the old one" behavior as every single-image module,
   * just applied to an array.
   */
  async update(
    id: string,
    updateGalleryItemDto: UpdateGalleryItemDto,
    files?: Express.Multer.File[],
  ): Promise<GalleryItem> {
    const galleryItem = await this.findOne(id);

    if (files && files.length > 0) {
      await this.deleteImages(galleryItem.images);
      const uploaded = await this.fileUploadsService.fileUploads(files);
      updateGalleryItemDto.images = Array.isArray(uploaded)
        ? uploaded
        : [uploaded];
    }

    Object.assign(galleryItem, updateGalleryItemDto);
    return this.galleryRepository.save(galleryItem);
  }

  /**
   * Soft delete a gallery item
   */
  async remove(id: string): Promise<void> {
    const galleryItem = await this.findOne(id);

    await this.deleteImages(galleryItem.images);

    const result = await this.galleryRepository.softDelete(id);
    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: record might already be removed.',
      );
    }
  }
}
