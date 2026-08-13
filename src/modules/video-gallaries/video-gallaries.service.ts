import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import type { Request } from 'express';

import { VideoGallary } from './entities/video-gallary.entity';
import { CreateVideoGallaryDto } from './dto/create-video-gallary.dto';
import { UpdateVideoGallaryDto } from './dto/update-video-gallary.dto';
import { GetVideoGallaryDto } from './dto/get-video-gallary.dto';
import { FileUploadsService } from '../../common/file-uploads/file-uploads.service';
import { DataQueryService } from '../../common/data-query/data-query.service';
import { IPagination } from '../../common/data-query/pagination.interface';

@Injectable()
export class VideoGallariesService {
  constructor(
    @InjectRepository(VideoGallary)
    private readonly videoGallaryRepository: Repository<VideoGallary>,
    private readonly fileUploadsService: FileUploadsService,
    private readonly dataQueryService: DataQueryService,
  ) {}

  /**
   * Create Video Gallary
   */
  public async create(
    req: Request,
    createDto: CreateVideoGallaryDto,
    file?: Express.Multer.File,
  ): Promise<VideoGallary> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    createDto.title = createDto.title.trim();

    // Prevent duplicate title
    const exists = await this.videoGallaryRepository.exists({
      where: { title: createDto.title },
    });

    if (exists) {
      throw new BadRequestException(
        'A video gallary with this title already exists.',
      );
    }

    // Handle thumbnail upload
    let thumbnailUrl: string | undefined;
    if (file) {
      const uploadedFiles = await this.fileUploadsService.fileUploads([file]);
      thumbnailUrl = uploadedFiles[0];
    }

    const newVideoGallary = this.videoGallaryRepository.create({
      ...createDto,
      added_by: String(userId),
      thumbnail: thumbnailUrl,
    });

    return this.videoGallaryRepository.save(newVideoGallary);
  }

  async findAll(query: GetVideoGallaryDto): Promise<IPagination<VideoGallary>> {
    const result = await this.dataQueryService.execute<VideoGallary>({
      repository: this.videoGallaryRepository,
      alias: 'videoGallary',
      pagination: query,
      relations: ['addedBy', 'videoGallaryCategory'],
      select: [
        'id',
        'title',
        'description',
        'thumbnail',
        'video_url',
        'is_active',
        'created_at',
        'added_by',
        'video_gallary_category_id',
      ],
      // Try this format - array of strings with dot notation
      selectRelations: [
        'addedBy.id',
        'addedBy.name',
        'addedBy.email',
        'videoGallaryCategory.id',
        'videoGallaryCategory.title',
      ],
    });

    if (!result.data.length) {
      throw new NotFoundException('No video gallaries found.');
    }

    return result;
  }
  /**
   * Get single video gallary
   */
  async findOne(id: string): Promise<VideoGallary> {
    const videoGallary = await this.videoGallaryRepository.findOne({
      where: { id },
      relations: {
        addedBy: true,
      },
      select: {
        addedBy: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    });

    if (!videoGallary) throw new NotFoundException('Video gallary not found.');

    return videoGallary;
  }

  /**
   * Update video gallary
   */
  public async update(
    id: string,
    updateDto: UpdateVideoGallaryDto,
    file?: Express.Multer.File,
  ): Promise<VideoGallary> {
    const videoGallary = await this.findOne(id);

    if (updateDto.title) {
      updateDto.title = updateDto.title.trim();

      const exists = await this.videoGallaryRepository.exists({
        where: {
          title: updateDto.title,
          id: Not(id),
        },
      });

      if (exists) {
        throw new BadRequestException(
          'Another video gallary with this title already exists.',
        );
      }
    }

    // Handle thumbnail update
    if (file) {
      if (videoGallary.thumbnail) {
        const updatedImage = await this.fileUploadsService.updateFileUploads({
          oldFile: videoGallary.thumbnail,
          currentFile: file,
        });

        updateDto.thumbnail = updatedImage as string;
      } else {
        const uploadedFiles = await this.fileUploadsService.fileUploads([file]);

        updateDto.thumbnail = uploadedFiles[0];
      }
    }

    Object.assign(videoGallary, updateDto);
    return this.videoGallaryRepository.save(videoGallary);
  }

  /**
   * Soft delete video gallary
   */
  public async remove(id: string): Promise<void> {
    const videoGallary = await this.findOne(id);

    if (videoGallary.thumbnail) {
      try {
        await this.fileUploadsService.deleteFileUploads(videoGallary.thumbnail);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.warn(`Failed to delete thumbnail: ${errorMessage}`);
      }
    }

    const result = await this.videoGallaryRepository.softDelete(id);

    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: record might already be removed.',
      );
    }
  }
}
