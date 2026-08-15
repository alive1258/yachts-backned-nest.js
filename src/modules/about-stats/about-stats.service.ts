import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { AboutStat } from './entities/about-stat.entity';
import { CreateAboutStatDto } from './dto/create-about-stat.dto';
import { UpdateAboutStatDto } from './dto/update-about-stat.dto';
import { GetAboutStatDto } from './dto/get-about-stat.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { DataQueryService } from 'src/common/data-query/data-query.service';

@Injectable()
export class AboutStatsService {
  constructor(
    @InjectRepository(AboutStat)
    private readonly aboutStatRepository: Repository<AboutStat>,
    private readonly dataQueryService: DataQueryService,
  ) {}

  /**
   * Create a new About Stat entry
   */
  async create(
    req: Request,
    createAboutStatDto: CreateAboutStatDto,
  ): Promise<AboutStat> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    const newStat = this.aboutStatRepository.create({
      ...createAboutStatDto,
      added_by: String(userId),
    });

    return this.aboutStatRepository.save(newStat);
  }

  /**
   * Get all About Stat entries with optional filters/pagination
   */
  async findAll(
    query: GetAboutStatDto,
  ): Promise<IPagination<Partial<AboutStat>>> {
    return this.dataQueryService.execute<Partial<AboutStat>>({
      repository: this.aboutStatRepository,
      alias: 'aboutStat',
      pagination: query,
      searchableFields: ['value', 'label'],
      filterableFields: ['position', 'is_active'],
      relations: ['addedBy'],
      select: [
        'id',
        'value',
        'label',
        'position',
        'is_active',
        'created_at',
        'updated_at',
      ],
      selectRelations: ['addedBy.id', 'addedBy.name', 'addedBy.email'],
    });
  }

  /**
   * Get all active About Stats, ordered for the public About page
   */
  async findActive(): Promise<AboutStat[]> {
    return this.aboutStatRepository.find({
      where: { is_active: true },
      order: { position: 'ASC' },
    });
  }

  /**
   * Get a single About Stat entry by UUID
   */
  async findOne(id: string): Promise<AboutStat> {
    const stat = await this.aboutStatRepository.findOne({
      where: { id },
      relations: ['addedBy'],
    });

    if (!stat) throw new NotFoundException('About stat not found.');

    return stat;
  }

  /**
   * Update an About Stat entry
   */
  async update(
    id: string,
    updateAboutStatDto: UpdateAboutStatDto,
  ): Promise<AboutStat> {
    const stat = await this.findOne(id);

    Object.assign(stat, updateAboutStatDto);
    return this.aboutStatRepository.save(stat);
  }

  /**
   * Soft delete an About Stat entry
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);

    const result = await this.aboutStatRepository.softDelete(id);
    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: record might already be removed.',
      );
    }
  }
}
