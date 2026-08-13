import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { Chamber } from './entities/chamber.entity';
import { CreateChamberDto, CreateChambersBulkDto } from './dto/create-chamber.dto';
import { UpdateChamberDto } from './dto/update-chamber.dto';
import { GetChamberDto } from './dto/get-chamber.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { DataQueryService } from 'src/common/data-query/data-query.service';
import { computeCapacity } from 'src/common/utils/chamber-time.util';

@Injectable()
export class ChambersService {
  constructor(
    @InjectRepository(Chamber)
    private readonly chamberRepository: Repository<Chamber>,
    private readonly dataQueryService: DataQueryService,
  ) {}

  /**
   * Multiple chambers can share a weekday (different locations/times), but
   * the doctor can't be in two places on the same day at overlapping times
   * — reject if [startTime, endTime) overlaps an existing chamber already
   * scheduled that day. Intervals overlap iff existingStart < newEnd &&
   * newStart < existingEnd.
   */
  private async assertNoTimeConflict(
    repo: Repository<Chamber>,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ): Promise<void> {
    const qb = repo
      .createQueryBuilder('chamber')
      .where('chamber.day_of_week = :dayOfWeek', { dayOfWeek })
      .andWhere('chamber.start_time < :endTime', { endTime })
      .andWhere('chamber.end_time > :startTime', { startTime });

    if (excludeId) {
      qb.andWhere('chamber.id != :excludeId', { excludeId });
    }

    const conflict = await qb.getOne();
    if (conflict) {
      throw new BadRequestException(
        `${conflict.location_name} is already scheduled on that day from ` +
          `${conflict.start_time}–${conflict.end_time} — chamber times must not overlap.`,
      );
    }
  }

  /**
   * Create a new chamber.
   */
  async create(req: Request, createDto: CreateChamberDto): Promise<Chamber> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    await this.assertNoTimeConflict(
      this.chamberRepository,
      createDto.day_of_week,
      createDto.start_time,
      createDto.end_time,
    );

    const chamber = this.chamberRepository.create({
      ...createDto,
      added_by: String(userId),
    });

    return this.chamberRepository.save(chamber);
  }

  /**
   * Create the same chamber schedule (location, fee, hours, ...) across
   * several weekdays at once — the "select multiple days" flow on the Add
   * Chamber form. Each day is conflict-checked and inserted inside one
   * transaction so a mid-batch failure doesn't leave a partial set behind.
   */
  async createBulk(
    req: Request,
    dto: CreateChambersBulkDto,
  ): Promise<Chamber[]> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    const { day_of_week: days, ...rest } = dto;

    return this.chamberRepository.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Chamber);
      const created: Chamber[] = [];

      for (const dayOfWeek of days) {
        await this.assertNoTimeConflict(
          repo,
          dayOfWeek,
          rest.start_time,
          rest.end_time,
        );

        const chamber = repo.create({
          ...rest,
          day_of_week: dayOfWeek,
          added_by: String(userId),
        });
        created.push(await repo.save(chamber));
      }

      return created;
    });
  }

  /**
   * Get all chambers with optional filters/pagination
   */
  async findAll(query: GetChamberDto): Promise<IPagination<Partial<Chamber>>> {
    return this.dataQueryService.execute<Partial<Chamber>>({
      repository: this.chamberRepository,
      alias: 'chamber',
      pagination: query,
      searchableFields: ['location_name', 'address'],
      filterableFields: ['day_of_week', 'is_active'],
      relations: ['addedBy'],
      select: [
        'id',
        'day_of_week',
        'location_name',
        'address',
        'fee',
        'start_time',
        'end_time',
        'avg_minutes_per_patient',
        'max_patients',
        'is_active',
        'created_at',
        'updated_at',
      ],
      selectRelations: ['addedBy.id', 'addedBy.name', 'addedBy.email'],
    });
  }

  /**
   * Get all active chambers, ordered Sun–Sat then by start time, for the
   * public booking form.
   */
  async findActive(): Promise<Chamber[]> {
    return this.chamberRepository.find({
      where: { is_active: true },
      order: { day_of_week: 'ASC', start_time: 'ASC' },
    });
  }

  /**
   * Get the active chamber scheduled for a given weekday, if any. When
   * several chambers share that weekday (allowed — see assertNoTimeConflict)
   * this deterministically picks the earliest one; callers that need a
   * specific chamber among several same-day options should pass chamber_id
   * explicitly instead of relying on this auto-resolution.
   */
  async findActiveByDayOfWeek(dayOfWeek: number): Promise<Chamber | null> {
    return this.chamberRepository.findOne({
      where: { day_of_week: dayOfWeek, is_active: true },
      order: { start_time: 'ASC' },
    });
  }

  /**
   * Get a single chamber by UUID
   */
  async findOne(id: string): Promise<Chamber> {
    const chamber = await this.chamberRepository.findOne({
      where: { id },
      relations: ['addedBy'],
    });

    if (!chamber) throw new NotFoundException('Chamber not found.');

    return chamber;
  }

  /**
   * Max patients bookable per day at this chamber — the explicit
   * max_patients override if set, otherwise derived from hours ÷ avg
   * minutes per patient.
   */
  capacityOf(chamber: Chamber): number {
    return (
      chamber.max_patients ??
      computeCapacity(
        chamber.start_time,
        chamber.end_time,
        chamber.avg_minutes_per_patient,
      )
    );
  }

  /**
   * Update a chamber
   */
  async update(id: string, updateDto: UpdateChamberDto): Promise<Chamber> {
    const chamber = await this.findOne(id);

    const scheduleChanged =
      updateDto.day_of_week !== undefined ||
      updateDto.start_time !== undefined ||
      updateDto.end_time !== undefined;

    if (scheduleChanged) {
      await this.assertNoTimeConflict(
        this.chamberRepository,
        updateDto.day_of_week ?? chamber.day_of_week,
        updateDto.start_time ?? chamber.start_time,
        updateDto.end_time ?? chamber.end_time,
        id,
      );
    }

    Object.assign(chamber, updateDto);
    return this.chamberRepository.save(chamber);
  }

  /**
   * Soft delete a chamber
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);

    const result = await this.chamberRepository.softDelete(id);
    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: record might already be removed.',
      );
    }
  }
}
