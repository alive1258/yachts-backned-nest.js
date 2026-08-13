import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { Sustainability } from './entities/sustainability.entity';
import { CreateSustainabilityDto } from './dto/create-sustainability.dto';
import { UpdateSustainabilityDto } from './dto/update-sustainability.dto';
import { GetSustainabilityDto } from './dto/get-sustainability.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { DataQueryService } from 'src/common/data-query/data-query.service';
import { FileUploadsService } from 'src/common/file-uploads/file-uploads.service';

@Injectable()
export class SustainabilityService {
  constructor(
    @InjectRepository(Sustainability)
    private readonly sustainabilityRepository: Repository<Sustainability>,
    private readonly fileUploadsService: FileUploadsService,
    private readonly dataQueryService: DataQueryService,
  ) {}

  /**
   * Create a new sustainability section entry
   */
  async create(
    req: Request,
    createSustainabilityDto: CreateSustainabilityDto,
    file?: Express.Multer.File,
  ): Promise<Sustainability> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    let imageUrl: string | undefined;
    if (file) {
      const uploadedFiles = await this.fileUploadsService.fileUploads([file]);
      imageUrl = uploadedFiles[0];
    }

    const newSustainability = this.sustainabilityRepository.create({
      ...createSustainabilityDto,
      added_by: String(userId),
      image: imageUrl,
    });

    return this.sustainabilityRepository.save(newSustainability);
  }

  /**
   * Get all sustainability entries with optional filters/pagination
   */
  async findAll(
    query: GetSustainabilityDto,
  ): Promise<IPagination<Partial<Sustainability>>> {
    return this.dataQueryService.execute<Partial<Sustainability>>({
      repository: this.sustainabilityRepository,
      alias: 'sustainability',
      pagination: query,
      searchableFields: ['title', 'label'],
      filterableFields: ['position', 'is_active'],
      relations: ['addedBy'],
      select: [
        'id',
        'label',
        'title',
        'description',
        'highlights',
        'button_text',
        'button_link',
        'badge_text',
        'badge_icon',
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
   * Get the currently active sustainability entry (for the public homepage)
   */
  async findActive(): Promise<Sustainability> {
    const sustainability = await this.sustainabilityRepository.findOne({
      where: { is_active: true },
      order: { position: 'ASC' },
    });

    if (!sustainability) {
      throw new NotFoundException('No active sustainability section found.');
    }

    return sustainability;
  }

  /**
   * Get a single sustainability entry by UUID
   */
  async findOne(id: string): Promise<Sustainability> {
    const sustainability = await this.sustainabilityRepository.findOne({
      where: { id },
      relations: ['addedBy'],
    });

    if (!sustainability)
      throw new NotFoundException('Sustainability section not found.');

    return sustainability;
  }

  /**
   * Update a sustainability entry
   */
  async update(
    id: string,
    updateSustainabilityDto: UpdateSustainabilityDto,
    file?: Express.Multer.File,
  ): Promise<Sustainability> {
    const sustainability = await this.findOne(id);

    if (file) {
      if (sustainability.image) {
        const updatedImage = await this.fileUploadsService.updateFileUploads({
          oldFile: sustainability.image,
          currentFile: file,
        });
        updateSustainabilityDto.image = updatedImage as string;
      } else {
        const uploadedFiles = await this.fileUploadsService.fileUploads([
          file,
        ]);
        updateSustainabilityDto.image = uploadedFiles[0];
      }
    }

    Object.assign(sustainability, updateSustainabilityDto);
    return this.sustainabilityRepository.save(sustainability);
  }

  /**
   * Soft delete a sustainability entry
   */
  async remove(id: string): Promise<void> {
    const sustainability = await this.findOne(id);

    if (sustainability.image) {
      try {
        await this.fileUploadsService.deleteFileUploads(
          sustainability.image,
        );
      } catch (err) {
        if (err instanceof Error) {
          console.warn(
            `Failed to delete sustainability image: ${err.message}`,
          );
        } else {
          console.warn('Failed to delete sustainability image:', err);
        }
      }
    }

    const result = await this.sustainabilityRepository.softDelete(id);
    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: record might already be removed.',
      );
    }
  }
}
