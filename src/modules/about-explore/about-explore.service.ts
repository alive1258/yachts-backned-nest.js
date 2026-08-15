import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { AboutExploreCard } from './entities/about-explore.entity';
import { CreateAboutExploreDto } from './dto/create-about-explore.dto';
import { UpdateAboutExploreDto } from './dto/update-about-explore.dto';
import { GetAboutExploreDto } from './dto/get-about-explore.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { DataQueryService } from 'src/common/data-query/data-query.service';

@Injectable()
export class AboutExploreService {
  constructor(
    @InjectRepository(AboutExploreCard)
    private readonly aboutExploreRepository: Repository<AboutExploreCard>,
    private readonly dataQueryService: DataQueryService,
  ) {}

  /**
   * Create a new About Explore card
   */
  async create(
    req: Request,
    createAboutExploreDto: CreateAboutExploreDto,
  ): Promise<AboutExploreCard> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    const newCard = this.aboutExploreRepository.create({
      ...createAboutExploreDto,
      added_by: String(userId),
    });

    return this.aboutExploreRepository.save(newCard);
  }

  /**
   * Get all About Explore cards with optional filters/pagination
   */
  async findAll(
    query: GetAboutExploreDto,
  ): Promise<IPagination<Partial<AboutExploreCard>>> {
    return this.dataQueryService.execute<Partial<AboutExploreCard>>({
      repository: this.aboutExploreRepository,
      alias: 'aboutExploreCard',
      pagination: query,
      searchableFields: ['title', 'description'],
      filterableFields: ['position', 'is_active'],
      relations: ['addedBy'],
      select: [
        'id',
        'title',
        'description',
        'href',
        'icon',
        'position',
        'is_active',
        'created_at',
        'updated_at',
      ],
      selectRelations: ['addedBy.id', 'addedBy.name', 'addedBy.email'],
    });
  }

  /**
   * Get all active About Explore cards, ordered for the public About page
   */
  async findActive(): Promise<AboutExploreCard[]> {
    return this.aboutExploreRepository.find({
      where: { is_active: true },
      order: { position: 'ASC' },
    });
  }

  /**
   * Get a single About Explore card by UUID
   */
  async findOne(id: string): Promise<AboutExploreCard> {
    const card = await this.aboutExploreRepository.findOne({
      where: { id },
      relations: ['addedBy'],
    });

    if (!card) throw new NotFoundException('About Explore card not found.');

    return card;
  }

  /**
   * Update an About Explore card
   */
  async update(
    id: string,
    updateAboutExploreDto: UpdateAboutExploreDto,
  ): Promise<AboutExploreCard> {
    const card = await this.findOne(id);

    Object.assign(card, updateAboutExploreDto);
    return this.aboutExploreRepository.save(card);
  }

  /**
   * Soft delete an About Explore card
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);

    const result = await this.aboutExploreRepository.softDelete(id);
    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: record might already be removed.',
      );
    }
  }
}
