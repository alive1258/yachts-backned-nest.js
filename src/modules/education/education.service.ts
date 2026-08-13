import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { Education } from './entities/education.entity';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { GetEducationDto } from './dto/get-education.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { DataQueryService } from 'src/common/data-query/data-query.service';

@Injectable()
export class EducationService {
  constructor(
    @InjectRepository(Education)
    private readonly educationRepository: Repository<Education>,
    private readonly dataQueryService: DataQueryService,
  ) {}

  /**
   * Create a new education section entry
   */
  async create(
    req: Request,
    createEducationDto: CreateEducationDto,
  ): Promise<Education> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    const newEducation = this.educationRepository.create({
      ...createEducationDto,
      added_by: String(userId),
    });

    return this.educationRepository.save(newEducation);
  }

  /**
   * Get all education entries with optional filters/pagination
   */
  async findAll(
    query: GetEducationDto,
  ): Promise<IPagination<Partial<Education>>> {
    return this.dataQueryService.execute<Partial<Education>>({
      repository: this.educationRepository,
      alias: 'education',
      pagination: query,
      searchableFields: ['heading', 'description'],
      filterableFields: ['position', 'is_active'],
      relations: ['addedBy'],
      select: [
        'id',
        'eyebrow',
        'heading',
        'description',
        'education',
        'certificates',
        'awards',
        'experience',
        'leadership',
        'position',
        'is_active',
        'created_at',
        'updated_at',
      ],
      selectRelations: ['addedBy.id', 'addedBy.name', 'addedBy.email'],
    });
  }

  /**
   * Get the currently active education entry (for the public homepage)
   */
  async findActive(): Promise<Education> {
    const education = await this.educationRepository.findOne({
      where: { is_active: true },
      order: { position: 'ASC' },
    });

    if (!education) {
      throw new NotFoundException('No active education section found.');
    }

    return education;
  }

  /**
   * Get a single education entry by UUID
   */
  async findOne(id: string): Promise<Education> {
    const education = await this.educationRepository.findOne({
      where: { id },
      relations: ['addedBy'],
    });

    if (!education)
      throw new NotFoundException('Education section not found.');

    return education;
  }

  /**
   * Update an education entry
   */
  async update(
    id: string,
    updateEducationDto: UpdateEducationDto,
  ): Promise<Education> {
    const education = await this.findOne(id);

    Object.assign(education, updateEducationDto);
    return this.educationRepository.save(education);
  }

  /**
   * Soft delete an education entry
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);

    const result = await this.educationRepository.softDelete(id);
    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: record might already be removed.',
      );
    }
  }
}
