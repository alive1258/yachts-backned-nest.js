import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { SustainabilityRoadmapItem } from './entities/sustainability-roadmap.entity';
import { CreateSustainabilityRoadmapDto } from './dto/create-sustainability-roadmap.dto';
import { UpdateSustainabilityRoadmapDto } from './dto/update-sustainability-roadmap.dto';
import { GetSustainabilityRoadmapDto } from './dto/get-sustainability-roadmap.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { DataQueryService } from 'src/common/data-query/data-query.service';

@Injectable()
export class SustainabilityRoadmapService {
  constructor(
    @InjectRepository(SustainabilityRoadmapItem)
    private readonly sustainabilityRoadmapRepository: Repository<SustainabilityRoadmapItem>,
    private readonly dataQueryService: DataQueryService,
  ) {}

  /**
   * Create a new Sustainability Roadmap item
   */
  async create(
    req: Request,
    createSustainabilityRoadmapDto: CreateSustainabilityRoadmapDto,
  ): Promise<SustainabilityRoadmapItem> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    const newItem = this.sustainabilityRoadmapRepository.create({
      ...createSustainabilityRoadmapDto,
      added_by: String(userId),
    });

    return this.sustainabilityRoadmapRepository.save(newItem);
  }

  /**
   * Get all Sustainability Roadmap items with optional filters/pagination
   */
  async findAll(
    query: GetSustainabilityRoadmapDto,
  ): Promise<IPagination<Partial<SustainabilityRoadmapItem>>> {
    return this.dataQueryService.execute<Partial<SustainabilityRoadmapItem>>({
      repository: this.sustainabilityRoadmapRepository,
      alias: 'sustainabilityRoadmapItem',
      pagination: query,
      searchableFields: ['year', 'milestone'],
      filterableFields: ['position', 'is_active'],
      relations: ['addedBy'],
      select: [
        'id',
        'year',
        'milestone',
        'position',
        'is_active',
        'created_at',
        'updated_at',
      ],
      selectRelations: ['addedBy.id', 'addedBy.name', 'addedBy.email'],
    });
  }

  /**
   * Get all active Sustainability Roadmap items, ordered for the public sustainability page
   */
  async findActive(): Promise<SustainabilityRoadmapItem[]> {
    return this.sustainabilityRoadmapRepository.find({
      where: { is_active: true },
      order: { position: 'ASC' },
    });
  }

  /**
   * Get a single Sustainability Roadmap item by UUID
   */
  async findOne(id: string): Promise<SustainabilityRoadmapItem> {
    const item = await this.sustainabilityRoadmapRepository.findOne({
      where: { id },
      relations: ['addedBy'],
    });

    if (!item)
      throw new NotFoundException('Sustainability Roadmap item not found.');

    return item;
  }

  /**
   * Update a Sustainability Roadmap item
   */
  async update(
    id: string,
    updateSustainabilityRoadmapDto: UpdateSustainabilityRoadmapDto,
  ): Promise<SustainabilityRoadmapItem> {
    const item = await this.findOne(id);

    Object.assign(item, updateSustainabilityRoadmapDto);
    return this.sustainabilityRoadmapRepository.save(item);
  }

  /**
   * Soft delete a Sustainability Roadmap item
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);

    const result = await this.sustainabilityRoadmapRepository.softDelete(id);
    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: record might already be removed.',
      );
    }
  }
}
