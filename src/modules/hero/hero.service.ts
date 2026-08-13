import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { Hero } from './entities/hero.entity';
import { CreateHeroDto } from './dto/create-hero.dto';
import { UpdateHeroDto } from './dto/update-hero.dto';
import { GetHeroDto } from './dto/get-hero.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { DataQueryService } from 'src/common/data-query/data-query.service';
import { FileUploadsService } from 'src/common/file-uploads/file-uploads.service';

@Injectable()
export class HeroService {
  constructor(
    @InjectRepository(Hero)
    private readonly heroRepository: Repository<Hero>,
    private readonly fileUploadsService: FileUploadsService,
    private readonly dataQueryService: DataQueryService,
  ) {}

  /**
   * Create a new hero section entry
   */
  async create(
    req: Request,
    createHeroDto: CreateHeroDto,
    file?: Express.Multer.File,
  ): Promise<Hero> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    let imageUrl: string | undefined;
    if (file) {
      const uploadedFiles = await this.fileUploadsService.fileUploads([file]);
      imageUrl = uploadedFiles[0];
    }

    const newHero = this.heroRepository.create({
      ...createHeroDto,
      added_by: String(userId),
      image: imageUrl,
    });

    return this.heroRepository.save(newHero);
  }

  /**
   * Get all hero entries with optional filters/pagination
   */
  async findAll(query: GetHeroDto): Promise<IPagination<Partial<Hero>>> {
    return this.dataQueryService.execute<Partial<Hero>>({
      repository: this.heroRepository,
      alias: 'hero',
      pagination: query,
      searchableFields: ['title', 'affiliation', 'badge'],
      filterableFields: ['position', 'is_active'],
      relations: ['addedBy'],
      select: [
        'id',
        'badge',
        'affiliation',
        'title',
        'description',
        'specialties',
        'primary_button_text',
        'primary_button_link',
        'secondary_button_text',
        'secondary_button_link',
        'stats',
        'rating_value',
        'rating_label',
        'floating_badge',
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
   * Get the currently active hero entry (for the public homepage)
   */
  async findActive(): Promise<Hero> {
    const hero = await this.heroRepository.findOne({
      where: { is_active: true },
      order: { position: 'ASC' },
    });

    if (!hero) {
      throw new NotFoundException('No active hero section found.');
    }

    return hero;
  }

  /**
   * Get a single hero entry by UUID
   */
  async findOne(id: string): Promise<Hero> {
    const hero = await this.heroRepository.findOne({
      where: { id },
      relations: ['addedBy'],
    });

    if (!hero) throw new NotFoundException('Hero section not found.');

    return hero;
  }

  /**
   * Update a hero entry
   */
  async update(
    id: string,
    updateHeroDto: UpdateHeroDto,
    file?: Express.Multer.File,
  ): Promise<Hero> {
    const hero = await this.findOne(id);

    if (file) {
      if (hero.image) {
        const updatedImage = await this.fileUploadsService.updateFileUploads({
          oldFile: hero.image,
          currentFile: file,
        });
        updateHeroDto.image = updatedImage as string;
      } else {
        const uploadedFiles = await this.fileUploadsService.fileUploads([file]);
        updateHeroDto.image = uploadedFiles[0];
      }
    }

    Object.assign(hero, updateHeroDto);
    return this.heroRepository.save(hero);
  }

  /**
   * Soft delete a hero entry
   */
  async remove(id: string): Promise<void> {
    const hero = await this.findOne(id);

    if (hero.image) {
      try {
        await this.fileUploadsService.deleteFileUploads(hero.image);
      } catch (err) {
        if (err instanceof Error) {
          console.warn(`Failed to delete hero image: ${err.message}`);
        } else {
          console.warn('Failed to delete hero image:', err);
        }
      }
    }

    const result = await this.heroRepository.softDelete(id);
    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: record might already be removed.',
      );
    }
  }
}
