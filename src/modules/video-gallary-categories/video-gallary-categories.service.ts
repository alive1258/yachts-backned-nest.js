import { Request } from 'express';
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { DataQueryService } from 'src/common/data-query/data-query.service';
import { IPagination } from 'src/common/data-query/pagination.interface';

import { VideoGallaryCategory } from './entities/video-gallary-category.entity';
import { CreateVideoGallaryCategoryDto } from './dto/create-video-gallary-category.dto';
import { UpdateVideoGallaryCategoryDto } from './dto/update-video-gallary-category.dto';
import { GetVideoGallaryCategoryDto } from './dto/get-video-gallary-category.dto';

@Injectable()
export class VideoGallaryCategoriesService {
  constructor(
    @InjectRepository(VideoGallaryCategory)
    private readonly videoGallaryCategoryRepository: Repository<VideoGallaryCategory>,
    private readonly dataQueryService: DataQueryService,
  ) {}

  // ---------------- CREATE ----------------
  async create(
    req: Request,
    createDto: CreateVideoGallaryCategoryDto,
  ): Promise<VideoGallaryCategory> {
    const userId = req?.user?.sub;
    if (!userId) {
      throw new UnauthorizedException(
        'Authentication required. You must be signed in to create a video gallery category.',
      );
    }

    const categoryTitle = createDto.title.trim();

    const exists = await this.videoGallaryCategoryRepository.exists({
      where: { title: categoryTitle },
    });
    if (exists) {
      throw new BadRequestException(
        `Video gallery category "${categoryTitle}" already exists.`,
      );
    }

    const newCategory = this.videoGallaryCategoryRepository.create({
      ...createDto,
      title: categoryTitle,
      added_by: userId,
    });

    return await this.videoGallaryCategoryRepository.save(newCategory);
  }

  // ---------------- FIND ALL ----------------
  // ---------------- FIND ALL ----------------
  async findAll(
    query?: GetVideoGallaryCategoryDto,
  ): Promise<IPagination<Partial<VideoGallaryCategory>>> {
    return this.dataQueryService.execute<Partial<VideoGallaryCategory>>({
      repository: this.videoGallaryCategoryRepository,
      alias: 'videoGallaryCategory',
      pagination: query ?? new GetVideoGallaryCategoryDto(),
      searchableFields: ['title'],
      select: ['id', 'title', 'is_active', 'created_at', 'updated_at'],
      relations: ['addedBy'],
    });
  }

  // ---------------- FIND ONE ----------------
  async findOne(id: string): Promise<VideoGallaryCategory> {
    const category = await this.videoGallaryCategoryRepository.findOne({
      where: { id },
      relations: ['addedBy'],
    });

    if (!category) {
      throw new BadRequestException('Video gallery category not found');
    }

    return category;
  }

  // ---------------- UPDATE ----------------
  async update(
    id: string,
    updateDto: UpdateVideoGallaryCategoryDto,
  ): Promise<VideoGallaryCategory> {
    const category = await this.findOne(id);

    if (updateDto.title) {
      const trimmedTitle = updateDto.title.trim();

      const exists = await this.videoGallaryCategoryRepository.exists({
        where: { title: trimmedTitle, id: Not(id) },
        withDeleted: true,
      });
      if (exists) {
        throw new BadRequestException(
          `Video gallery category title "${trimmedTitle}" is already in use.`,
        );
      }

      category.title = trimmedTitle;
    }

    Object.assign(category, updateDto);
    return await this.videoGallaryCategoryRepository.save(category);
  }

  // ---------------- DELETE (HARD) ----------------
  async remove(id: string): Promise<void> {
    const result = await this.videoGallaryCategoryRepository.delete(id);
    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: Record not found or already deleted.',
      );
    }
  }
}
