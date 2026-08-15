import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { Yacht } from './entities/yacht.entity';
import { CreateYachtDto } from './dto/create-yacht.dto';
import { UpdateYachtDto } from './dto/update-yacht.dto';
import { GetYachtDto } from './dto/get-yacht.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { DataQueryService } from 'src/common/data-query/data-query.service';
import { FileUploadsService } from 'src/common/file-uploads/file-uploads.service';

export interface YachtUploadFiles {
  heroImage?: Express.Multer.File[];
  gallery?: Express.Multer.File[];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class YachtsService {
  constructor(
    @InjectRepository(Yacht)
    private readonly yachtRepository: Repository<Yacht>,
    private readonly fileUploadsService: FileUploadsService,
    private readonly dataQueryService: DataQueryService,
  ) {}

  /**
   * Resolve a unique slug — uses the provided slug (or one derived from the
   * name) as-is if free, otherwise appends -2, -3, ... until it finds a gap.
   */
  private async resolveUniqueSlug(
    desired: string,
    excludeId?: string,
  ): Promise<string> {
    const base = slugify(desired);
    if (!base) {
      throw new BadRequestException('Could not derive a valid slug.');
    }

    let candidate = base;
    let suffix = 2;

    while (true) {
      const existing = await this.yachtRepository.findOne({
        where: { slug: candidate },
      });
      if (!existing || existing.id === excludeId) break;
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }

    return candidate;
  }

  /**
   * Create a new yacht
   */
  async create(
    req: Request,
    createYachtDto: CreateYachtDto,
    files?: YachtUploadFiles,
  ): Promise<Yacht> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    const heroFile = files?.heroImage?.[0];
    if (!heroFile) {
      throw new BadRequestException('A hero image is required.');
    }

    const slug = await this.resolveUniqueSlug(
      createYachtDto.slug || createYachtDto.name,
    );

    const heroUploaded = await this.fileUploadsService.fileUploads([heroFile]);
    const heroImage = Array.isArray(heroUploaded)
      ? heroUploaded[0]
      : heroUploaded;

    let gallery: string[] = [];
    if (files?.gallery && files.gallery.length > 0) {
      const uploaded = await this.fileUploadsService.fileUploads(
        files.gallery,
      );
      gallery = Array.isArray(uploaded) ? uploaded : [uploaded];
    }

    const newYacht = this.yachtRepository.create({
      ...createYachtDto,
      slug,
      hero_image: heroImage,
      gallery,
      rates: createYachtDto.rates ?? [],
      added_by: String(userId),
    });

    return this.yachtRepository.save(newYacht);
  }

  /**
   * Get all yachts with optional filters/pagination
   */
  async findAll(query: GetYachtDto): Promise<IPagination<Partial<Yacht>>> {
    return this.dataQueryService.execute<Partial<Yacht>>({
      repository: this.yachtRepository,
      alias: 'yacht',
      pagination: query,
      searchableFields: ['name', 'slug', 'tagline'],
      filterableFields: ['category', 'region', 'position', 'is_active'],
      relations: ['addedBy'],
      select: [
        'id',
        'slug',
        'name',
        'tagline',
        'category',
        'length_ft',
        'length_m',
        'guests',
        'cabins',
        'crew',
        'price_per_night',
        'currency',
        'price_unit',
        'region',
        'hero_image',
        'position',
        'is_active',
        'created_at',
        'updated_at',
      ],
      selectRelations: ['addedBy.id', 'addedBy.name', 'addedBy.email'],
    });
  }

  /**
   * Get all active yachts, ordered for the public fleet page
   */
  async findActive(): Promise<Yacht[]> {
    return this.yachtRepository.find({
      where: { is_active: true },
      order: { position: 'ASC' },
    });
  }

  /**
   * Get a single yacht by UUID
   */
  async findOne(id: string): Promise<Yacht> {
    const yacht = await this.yachtRepository.findOne({
      where: { id },
      relations: ['addedBy'],
    });

    if (!yacht) throw new NotFoundException('Yacht not found.');

    return yacht;
  }

  /**
   * Get a single active yacht by slug (public detail page)
   */
  async findBySlug(slug: string): Promise<Yacht> {
    const yacht = await this.yachtRepository.findOne({
      where: { slug, is_active: true },
    });

    if (!yacht) throw new NotFoundException('Yacht not found.');

    return yacht;
  }

  /**
   * Update a yacht
   */
  async update(
    id: string,
    updateYachtDto: UpdateYachtDto,
    files?: YachtUploadFiles,
  ): Promise<Yacht> {
    const yacht = await this.findOne(id);

    if (updateYachtDto.slug && updateYachtDto.slug !== yacht.slug) {
      updateYachtDto.slug = await this.resolveUniqueSlug(
        updateYachtDto.slug,
        id,
      );
    } else {
      delete updateYachtDto.slug;
    }

    const heroFile = files?.heroImage?.[0];
    if (heroFile) {
      const updatedImage = await this.fileUploadsService.updateFileUploads({
        oldFile: yacht.hero_image,
        currentFile: heroFile,
      });
      updateYachtDto.hero_image = updatedImage as string;
    }

    if (files?.gallery && files.gallery.length > 0) {
      if (yacht.gallery?.length) {
        await Promise.all(
          yacht.gallery.map(async (image) => {
            try {
              await this.fileUploadsService.deleteFileUploads(image);
            } catch (err) {
              if (err instanceof Error) {
                console.warn(`Failed to delete yacht gallery image: ${err.message}`);
              } else {
                console.warn('Failed to delete yacht gallery image:', err);
              }
            }
          }),
        );
      }
      const uploaded = await this.fileUploadsService.fileUploads(
        files.gallery,
      );
      updateYachtDto.gallery = Array.isArray(uploaded) ? uploaded : [uploaded];
    }

    Object.assign(yacht, updateYachtDto);
    return this.yachtRepository.save(yacht);
  }

  /**
   * Soft delete a yacht
   */
  async remove(id: string): Promise<void> {
    const yacht = await this.findOne(id);

    try {
      await this.fileUploadsService.deleteFileUploads(yacht.hero_image);
    } catch (err) {
      if (err instanceof Error) {
        console.warn(`Failed to delete yacht hero image: ${err.message}`);
      } else {
        console.warn('Failed to delete yacht hero image:', err);
      }
    }

    if (yacht.gallery?.length) {
      await Promise.all(
        yacht.gallery.map(async (image) => {
          try {
            await this.fileUploadsService.deleteFileUploads(image);
          } catch (err) {
            if (err instanceof Error) {
              console.warn(`Failed to delete yacht gallery image: ${err.message}`);
            } else {
              console.warn('Failed to delete yacht gallery image:', err);
            }
          }
        }),
      );
    }

    const result = await this.yachtRepository.softDelete(id);
    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: record might already be removed.',
      );
    }
  }
}
