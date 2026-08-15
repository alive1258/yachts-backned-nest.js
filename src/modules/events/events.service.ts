import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { GetEventDto } from './dto/get-event.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { DataQueryService } from 'src/common/data-query/data-query.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly dataQueryService: DataQueryService,
  ) {}

  /**
   * Create a new event entry
   */
  async create(req: Request, createEventDto: CreateEventDto): Promise<Event> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    const newEvent = this.eventRepository.create({
      ...createEventDto,
      added_by: String(userId),
    });

    return this.eventRepository.save(newEvent);
  }

  /**
   * Get all event entries with optional filters/pagination
   */
  async findAll(query: GetEventDto): Promise<IPagination<Partial<Event>>> {
    return this.dataQueryService.execute<Partial<Event>>({
      repository: this.eventRepository,
      alias: 'event',
      pagination: query,
      searchableFields: ['name', 'location', 'yacht'],
      filterableFields: ['position', 'is_active'],
      relations: ['addedBy'],
      select: [
        'id',
        'name',
        'date_range',
        'location',
        'description',
        'yacht',
        'position',
        'is_active',
        'created_at',
        'updated_at',
      ],
      selectRelations: ['addedBy.id', 'addedBy.name', 'addedBy.email'],
    });
  }

  /**
   * Get all active events, ordered for the public events page
   */
  async findActive(): Promise<Event[]> {
    return this.eventRepository.find({
      where: { is_active: true },
      order: { position: 'ASC' },
    });
  }

  /**
   * Get a single event entry by UUID
   */
  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['addedBy'],
    });

    if (!event) throw new NotFoundException('Event not found.');

    return event;
  }

  /**
   * Update an event entry
   */
  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);

    Object.assign(event, updateEventDto);
    return this.eventRepository.save(event);
  }

  /**
   * Soft delete an event entry
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);

    const result = await this.eventRepository.softDelete(id);
    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: record might already be removed.',
      );
    }
  }
}
