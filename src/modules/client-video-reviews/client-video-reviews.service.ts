import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { ClientVideoReview } from './entities/client-video-review.entity';
import { CreateClientVideoReviewDto } from './dto/create-client-video-review.dto';
import { UpdateClientVideoReviewDto } from './dto/update-client-video-review.dto';
import { GetClientVideoReviewDto } from './dto/get-client-video-review.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { DataQueryService } from 'src/common/data-query/data-query.service';
import { FileUploadsService } from 'src/common/file-uploads/file-uploads.service';

@Injectable()
export class ClientVideoReviewsService {
  constructor(
    @InjectRepository(ClientVideoReview)
    private readonly clientVideoReviewRepository: Repository<ClientVideoReview>,
    private readonly fileUploadsService: FileUploadsService,
    private readonly dataQueryService: DataQueryService,
  ) {}

  /**
   * Create a new client video review
   */
  async create(
    req: Request,
    createDto: CreateClientVideoReviewDto,
    file?: Express.Multer.File,
  ): Promise<ClientVideoReview> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    let imageUrl: string | undefined;
    if (file) {
      const uploadedFiles = await this.fileUploadsService.fileUploads([file]);
      imageUrl = uploadedFiles[0];
    }

    const newReview = this.clientVideoReviewRepository.create({
      ...createDto,
      added_by: String(userId),
      image: imageUrl,
    });

    return this.clientVideoReviewRepository.save(newReview);
  }

  /**
   * Get all client video reviews with optional filters/pagination
   */
  async findAll(
    query: GetClientVideoReviewDto,
  ): Promise<IPagination<Partial<ClientVideoReview>>> {
    return this.dataQueryService.execute<Partial<ClientVideoReview>>({
      repository: this.clientVideoReviewRepository,
      alias: 'clientVideoReview',
      pagination: query,
      searchableFields: ['name', 'designation', 'description'],
      filterableFields: ['rating', 'position', 'is_active'],
      relations: ['addedBy'],
      select: [
        'id',
        'name',
        'designation',
        'image',
        'description',
        'rating',
        'video_url',
        'position',
        'is_active',
        'created_at',
        'updated_at',
      ],
      selectRelations: ['addedBy.id', 'addedBy.name', 'addedBy.email'],
    });
  }

  /**
   * Get all active client video reviews, ordered for the public homepage
   */
  async findActive(): Promise<ClientVideoReview[]> {
    return this.clientVideoReviewRepository.find({
      where: { is_active: true },
      order: { position: 'ASC' },
    });
  }

  /**
   * Get a single client video review by UUID
   */
  async findOne(id: string): Promise<ClientVideoReview> {
    const review = await this.clientVideoReviewRepository.findOne({
      where: { id },
      relations: ['addedBy'],
    });

    if (!review) throw new NotFoundException('Client video review not found.');

    return review;
  }

  /**
   * Update a client video review
   */
  async update(
    id: string,
    updateDto: UpdateClientVideoReviewDto,
    file?: Express.Multer.File,
  ): Promise<ClientVideoReview> {
    const review = await this.findOne(id);

    if (file) {
      if (review.image) {
        const updatedImage = await this.fileUploadsService.updateFileUploads({
          oldFile: review.image,
          currentFile: file,
        });
        updateDto.image = updatedImage as string;
      } else {
        const uploadedFiles = await this.fileUploadsService.fileUploads([file]);
        updateDto.image = uploadedFiles[0];
      }
    }

    Object.assign(review, updateDto);
    return this.clientVideoReviewRepository.save(review);
  }

  /**
   * Soft delete a client video review
   */
  async remove(id: string): Promise<void> {
    const review = await this.findOne(id);

    if (review.image) {
      try {
        await this.fileUploadsService.deleteFileUploads(review.image);
      } catch (err) {
        if (err instanceof Error) {
          console.warn(`Failed to delete client video review image: ${err.message}`);
        } else {
          console.warn('Failed to delete client video review image:', err);
        }
      }
    }

    const result = await this.clientVideoReviewRepository.softDelete(id);
    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: record might already be removed.',
      );
    }
  }
}
