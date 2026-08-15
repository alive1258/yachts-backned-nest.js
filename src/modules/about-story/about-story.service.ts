import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { AboutStory } from './entities/about-story.entity';
import { CreateAboutStoryDto } from './dto/create-about-story.dto';
import { UpdateAboutStoryDto } from './dto/update-about-story.dto';
import { GetAboutStoryDto } from './dto/get-about-story.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { DataQueryService } from 'src/common/data-query/data-query.service';
import { FileUploadsService } from 'src/common/file-uploads/file-uploads.service';

@Injectable()
export class AboutStoryService {
  constructor(
    @InjectRepository(AboutStory)
    private readonly aboutStoryRepository: Repository<AboutStory>,
    private readonly fileUploadsService: FileUploadsService,
    private readonly dataQueryService: DataQueryService,
  ) {}

  /**
   * Create a new About Story entry
   */
  async create(
    req: Request,
    createAboutStoryDto: CreateAboutStoryDto,
    file?: Express.Multer.File,
  ): Promise<AboutStory> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    let imageUrl: string | undefined;
    if (file) {
      const uploadedFiles = await this.fileUploadsService.fileUploads([file]);
      imageUrl = uploadedFiles[0];
    }

    const newStory = this.aboutStoryRepository.create({
      ...createAboutStoryDto,
      added_by: String(userId),
      image: imageUrl,
    });

    return this.aboutStoryRepository.save(newStory);
  }

  /**
   * Get all About Story entries with optional filters/pagination
   */
  async findAll(
    query: GetAboutStoryDto,
  ): Promise<IPagination<Partial<AboutStory>>> {
    return this.dataQueryService.execute<Partial<AboutStory>>({
      repository: this.aboutStoryRepository,
      alias: 'aboutStory',
      pagination: query,
      searchableFields: ['heading', 'eyebrow'],
      filterableFields: ['position', 'is_active'],
      relations: ['addedBy'],
      select: [
        'id',
        'eyebrow',
        'heading',
        'paragraphs',
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
   * Get the currently active About Story entry (for the public About page)
   */
  async findActive(): Promise<AboutStory> {
    const story = await this.aboutStoryRepository.findOne({
      where: { is_active: true },
      order: { position: 'ASC' },
    });

    if (!story) {
      throw new NotFoundException('No active About Story found.');
    }

    return story;
  }

  /**
   * Get a single About Story entry by UUID
   */
  async findOne(id: string): Promise<AboutStory> {
    const story = await this.aboutStoryRepository.findOne({
      where: { id },
      relations: ['addedBy'],
    });

    if (!story) throw new NotFoundException('About Story not found.');

    return story;
  }

  /**
   * Update an About Story entry
   */
  async update(
    id: string,
    updateAboutStoryDto: UpdateAboutStoryDto,
    file?: Express.Multer.File,
  ): Promise<AboutStory> {
    const story = await this.findOne(id);

    if (file) {
      if (story.image) {
        const updatedImage = await this.fileUploadsService.updateFileUploads({
          oldFile: story.image,
          currentFile: file,
        });
        updateAboutStoryDto.image = updatedImage as string;
      } else {
        const uploadedFiles = await this.fileUploadsService.fileUploads([
          file,
        ]);
        updateAboutStoryDto.image = uploadedFiles[0];
      }
    }

    Object.assign(story, updateAboutStoryDto);
    return this.aboutStoryRepository.save(story);
  }

  /**
   * Soft delete an About Story entry
   */
  async remove(id: string): Promise<void> {
    const story = await this.findOne(id);

    if (story.image) {
      try {
        await this.fileUploadsService.deleteFileUploads(story.image);
      } catch (err) {
        if (err instanceof Error) {
          console.warn(`Failed to delete About Story image: ${err.message}`);
        } else {
          console.warn('Failed to delete About Story image:', err);
        }
      }
    }

    const result = await this.aboutStoryRepository.softDelete(id);
    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: record might already be removed.',
      );
    }
  }
}
