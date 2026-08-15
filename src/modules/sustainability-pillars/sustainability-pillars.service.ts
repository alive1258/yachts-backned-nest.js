import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { SustainabilityPillar } from './entities/sustainability-pillar.entity';
import { CreateSustainabilityPillarDto } from './dto/create-sustainability-pillar.dto';
import { UpdateSustainabilityPillarDto } from './dto/update-sustainability-pillar.dto';
import { GetSustainabilityPillarDto } from './dto/get-sustainability-pillar.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { DataQueryService } from 'src/common/data-query/data-query.service';

@Injectable()
export class SustainabilityPillarsService {
  constructor(
    @InjectRepository(SustainabilityPillar)
    private readonly sustainabilityPillarRepository: Repository<SustainabilityPillar>,
    private readonly dataQueryService: DataQueryService,
  ) {}

  /**
   * Create a new Sustainability Pillar
   */
  async create(
    req: Request,
    createSustainabilityPillarDto: CreateSustainabilityPillarDto,
  ): Promise<SustainabilityPillar> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    const newPillar = this.sustainabilityPillarRepository.create({
      ...createSustainabilityPillarDto,
      added_by: String(userId),
    });

    return this.sustainabilityPillarRepository.save(newPillar);
  }

  /**
   * Get all Sustainability Pillars with optional filters/pagination
   */
  async findAll(
    query: GetSustainabilityPillarDto,
  ): Promise<IPagination<Partial<SustainabilityPillar>>> {
    return this.dataQueryService.execute<Partial<SustainabilityPillar>>({
      repository: this.sustainabilityPillarRepository,
      alias: 'sustainabilityPillar',
      pagination: query,
      searchableFields: ['title', 'description'],
      filterableFields: ['position', 'is_active'],
      relations: ['addedBy'],
      select: [
        'id',
        'title',
        'description',
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
   * Get all active Sustainability Pillars, ordered for the public sustainability page
   */
  async findActive(): Promise<SustainabilityPillar[]> {
    return this.sustainabilityPillarRepository.find({
      where: { is_active: true },
      order: { position: 'ASC' },
    });
  }

  /**
   * Get a single Sustainability Pillar by UUID
   */
  async findOne(id: string): Promise<SustainabilityPillar> {
    const pillar = await this.sustainabilityPillarRepository.findOne({
      where: { id },
      relations: ['addedBy'],
    });

    if (!pillar) throw new NotFoundException('Sustainability Pillar not found.');

    return pillar;
  }

  /**
   * Update a Sustainability Pillar
   */
  async update(
    id: string,
    updateSustainabilityPillarDto: UpdateSustainabilityPillarDto,
  ): Promise<SustainabilityPillar> {
    const pillar = await this.findOne(id);

    Object.assign(pillar, updateSustainabilityPillarDto);
    return this.sustainabilityPillarRepository.save(pillar);
  }

  /**
   * Soft delete a Sustainability Pillar
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);

    const result = await this.sustainabilityPillarRepository.softDelete(id);
    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: record might already be removed.',
      );
    }
  }
}
