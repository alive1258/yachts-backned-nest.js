import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { LifeAboardPhoto } from './entities/life-aboard-photo.entity';
import { CreateLifeAboardPhotoDto } from './dto/create-life-aboard-photo.dto';
import { UpdateLifeAboardPhotoDto } from './dto/update-life-aboard-photo.dto';
import { GetLifeAboardPhotoDto } from './dto/get-life-aboard-photo.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { DataQueryService } from 'src/common/data-query/data-query.service';
import { FileUploadsService } from 'src/common/file-uploads/file-uploads.service';

@Injectable()
export class LifeAboardPhotosService {
  constructor(
    @InjectRepository(LifeAboardPhoto)
    private readonly lifeAboardPhotoRepository: Repository<LifeAboardPhoto>,
    private readonly fileUploadsService: FileUploadsService,
    private readonly dataQueryService: DataQueryService,
  ) {}

  /**
   * Create a new Life Aboard photo entry
   */
  async create(
    req: Request,
    createLifeAboardPhotoDto: CreateLifeAboardPhotoDto,
    file: Express.Multer.File,
  ): Promise<LifeAboardPhoto> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');
    if (!file) throw new BadRequestException('A photo is required.');

    const uploadedFiles = await this.fileUploadsService.fileUploads([file]);

    const newPhoto = this.lifeAboardPhotoRepository.create({
      ...createLifeAboardPhotoDto,
      added_by: String(userId),
      image: uploadedFiles[0],
    });

    return this.lifeAboardPhotoRepository.save(newPhoto);
  }

  /**
   * Get all Life Aboard photo entries with optional filters/pagination
   */
  async findAll(
    query: GetLifeAboardPhotoDto,
  ): Promise<IPagination<Partial<LifeAboardPhoto>>> {
    return this.dataQueryService.execute<Partial<LifeAboardPhoto>>({
      repository: this.lifeAboardPhotoRepository,
      alias: 'lifeAboardPhoto',
      pagination: query,
      filterableFields: ['position', 'is_active'],
      relations: ['addedBy'],
      select: [
        'id',
        'image',
        'position',
        'is_active',
        'created_at',
        'updated_at',
      ],
      selectRelations: ['addedBy.id', 'addedBy.name', 'addedBy.email'],
    });
  }

  /**
   * Get all active Life Aboard photos, ordered for the public fleet page
   */
  async findActive(): Promise<LifeAboardPhoto[]> {
    return this.lifeAboardPhotoRepository.find({
      where: { is_active: true },
      order: { position: 'ASC' },
    });
  }

  /**
   * Get a single Life Aboard photo entry by UUID
   */
  async findOne(id: string): Promise<LifeAboardPhoto> {
    const photo = await this.lifeAboardPhotoRepository.findOne({
      where: { id },
      relations: ['addedBy'],
    });

    if (!photo) throw new NotFoundException('Life Aboard photo not found.');

    return photo;
  }

  /**
   * Update a Life Aboard photo entry
   */
  async update(
    id: string,
    updateLifeAboardPhotoDto: UpdateLifeAboardPhotoDto,
    file?: Express.Multer.File,
  ): Promise<LifeAboardPhoto> {
    const photo = await this.findOne(id);

    if (file) {
      const updatedImage = await this.fileUploadsService.updateFileUploads({
        oldFile: photo.image,
        currentFile: file,
      });
      updateLifeAboardPhotoDto.image = updatedImage as string;
    }

    Object.assign(photo, updateLifeAboardPhotoDto);
    return this.lifeAboardPhotoRepository.save(photo);
  }

  /**
   * Soft delete a Life Aboard photo entry
   */
  async remove(id: string): Promise<void> {
    const photo = await this.findOne(id);

    try {
      await this.fileUploadsService.deleteFileUploads(photo.image);
    } catch (err) {
      if (err instanceof Error) {
        console.warn(`Failed to delete life aboard photo: ${err.message}`);
      } else {
        console.warn('Failed to delete life aboard photo:', err);
      }
    }

    const result = await this.lifeAboardPhotoRepository.softDelete(id);
    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: record might already be removed.',
      );
    }
  }
}
