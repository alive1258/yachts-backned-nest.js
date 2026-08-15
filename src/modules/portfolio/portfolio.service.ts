import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { PortfolioItem } from './entities/portfolio.entity';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { GetPortfolioDto } from './dto/get-portfolio.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { DataQueryService } from 'src/common/data-query/data-query.service';
import { FileUploadsService } from 'src/common/file-uploads/file-uploads.service';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(PortfolioItem)
    private readonly portfolioRepository: Repository<PortfolioItem>,
    private readonly fileUploadsService: FileUploadsService,
    private readonly dataQueryService: DataQueryService,
  ) {}

  /**
   * Create a new Portfolio card
   */
  async create(
    req: Request,
    createPortfolioDto: CreatePortfolioDto,
    file?: Express.Multer.File,
  ): Promise<PortfolioItem> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    let imageUrl: string | undefined;
    if (file) {
      const uploadedFiles = await this.fileUploadsService.fileUploads([file]);
      imageUrl = uploadedFiles[0];
    }

    const newItem = this.portfolioRepository.create({
      ...createPortfolioDto,
      added_by: String(userId),
      image: imageUrl,
    });

    return this.portfolioRepository.save(newItem);
  }

  /**
   * Get all Portfolio cards with optional filters/pagination
   */
  async findAll(
    query: GetPortfolioDto,
  ): Promise<IPagination<Partial<PortfolioItem>>> {
    return this.dataQueryService.execute<Partial<PortfolioItem>>({
      repository: this.portfolioRepository,
      alias: 'portfolioItem',
      pagination: query,
      searchableFields: ['title', 'description'],
      filterableFields: ['position', 'is_active'],
      relations: ['addedBy'],
      select: [
        'id',
        'title',
        'description',
        'icon',
        'image',
        'href',
        'position',
        'is_active',
        'created_at',
        'updated_at',
      ],
      selectRelations: ['addedBy.id', 'addedBy.name', 'addedBy.email'],
    });
  }

  /**
   * Get all active Portfolio cards, ordered for the public portfolio page
   */
  async findActive(): Promise<PortfolioItem[]> {
    return this.portfolioRepository.find({
      where: { is_active: true },
      order: { position: 'ASC' },
    });
  }

  /**
   * Get a single Portfolio card by UUID
   */
  async findOne(id: string): Promise<PortfolioItem> {
    const item = await this.portfolioRepository.findOne({
      where: { id },
      relations: ['addedBy'],
    });

    if (!item) throw new NotFoundException('Portfolio item not found.');

    return item;
  }

  /**
   * Update a Portfolio card
   */
  async update(
    id: string,
    updatePortfolioDto: UpdatePortfolioDto,
    file?: Express.Multer.File,
  ): Promise<PortfolioItem> {
    const item = await this.findOne(id);

    if (file) {
      if (item.image) {
        const updatedImage = await this.fileUploadsService.updateFileUploads({
          oldFile: item.image,
          currentFile: file,
        });
        updatePortfolioDto.image = updatedImage as string;
      } else {
        const uploadedFiles = await this.fileUploadsService.fileUploads([
          file,
        ]);
        updatePortfolioDto.image = uploadedFiles[0];
      }
    }

    Object.assign(item, updatePortfolioDto);
    return this.portfolioRepository.save(item);
  }

  /**
   * Soft delete a Portfolio card
   */
  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);

    if (item.image) {
      try {
        await this.fileUploadsService.deleteFileUploads(item.image);
      } catch (err) {
        if (err instanceof Error) {
          console.warn(`Failed to delete portfolio image: ${err.message}`);
        } else {
          console.warn('Failed to delete portfolio image:', err);
        }
      }
    }

    const result = await this.portfolioRepository.softDelete(id);
    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: record might already be removed.',
      );
    }
  }
}
