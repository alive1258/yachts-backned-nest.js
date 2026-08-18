import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { Experience } from './entities/experience.entity';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { GetExperienceDto } from './dto/get-experience.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { DataQueryService } from 'src/common/data-query/data-query.service';
import { FileUploadsService } from 'src/common/file-uploads/file-uploads.service';

@Injectable()
export class ExperiencesService {
  constructor(
    @InjectRepository(Experience)
    private readonly experienceRepository: Repository<Experience>,
    private readonly fileUploadsService: FileUploadsService,
    private readonly dataQueryService: DataQueryService,
  ) {}

  /**
   * Create a new experience entry
   */
  async create(
    req: Request,
    createExperienceDto: CreateExperienceDto,
    file?: Express.Multer.File,
  ): Promise<Experience> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    let imageUrl: string | undefined;
    if (file) {
      const uploadedFiles = await this.fileUploadsService.fileUploads([file]);
      imageUrl = uploadedFiles[0];
    }

    const newExperience = this.experienceRepository.create({
      ...createExperienceDto,
      added_by: String(userId),
      image: imageUrl,
    });

    return this.experienceRepository.save(newExperience);
  }

  /**
   * Get all experience entries with optional filters/pagination
   */
  async findAll(
    query: GetExperienceDto,
  ): Promise<IPagination<Partial<Experience>>> {
    return this.dataQueryService.execute<Partial<Experience>>({
      repository: this.experienceRepository,
      alias: 'experience',
      pagination: query,
      searchableFields: ['title', 'description'],
      filterableFields: ['position', 'is_active'],
      relations: ['addedBy'],
      select: [
        'id',
        'title',
        'description',
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
   * Get all currently active experiences (for the public site), ordered
   */
  async findActive(): Promise<Experience[]> {
    return this.experienceRepository.find({
      where: { is_active: true },
      order: { position: 'ASC' },
    });
  }

  /**
   * Get a single experience entry by UUID
   */
  async findOne(id: string): Promise<Experience> {
    const experience = await this.experienceRepository.findOne({
      where: { id },
      relations: ['addedBy'],
    });

    if (!experience) throw new NotFoundException('Experience not found.');

    return experience;
  }

  /**
   * Update an experience entry
   */
  async update(
    id: string,
    updateExperienceDto: UpdateExperienceDto,
    file?: Express.Multer.File,
  ): Promise<Experience> {
    const experience = await this.findOne(id);

    if (file) {
      if (experience.image) {
        const updatedImage = await this.fileUploadsService.updateFileUploads({
          oldFile: experience.image,
          currentFile: file,
        });
        updateExperienceDto.image = updatedImage as string;
      } else {
        const uploadedFiles = await this.fileUploadsService.fileUploads([
          file,
        ]);
        updateExperienceDto.image = uploadedFiles[0];
      }
    }

    Object.assign(experience, updateExperienceDto);
    return this.experienceRepository.save(experience);
  }

  /**
   * Soft delete an experience entry
   */
  async remove(id: string): Promise<void> {
    const experience = await this.findOne(id);

    if (experience.image) {
      try {
        await this.fileUploadsService.deleteFileUploads(experience.image);
      } catch (err) {
        if (err instanceof Error) {
          console.warn(`Failed to delete experience image: ${err.message}`);
        } else {
          console.warn('Failed to delete experience image:', err);
        }
      }
    }

    const result = await this.experienceRepository.softDelete(id);
    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: record might already be removed.',
      );
    }
  }
}
