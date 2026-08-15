import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { InnovationConcept } from './entities/innovation-concept.entity';
import { CreateInnovationConceptDto } from './dto/create-innovation-concept.dto';
import { UpdateInnovationConceptDto } from './dto/update-innovation-concept.dto';
import { GetInnovationConceptDto } from './dto/get-innovation-concept.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { DataQueryService } from 'src/common/data-query/data-query.service';
import { FileUploadsService } from 'src/common/file-uploads/file-uploads.service';

@Injectable()
export class InnovationConceptsService {
  constructor(
    @InjectRepository(InnovationConcept)
    private readonly innovationConceptRepository: Repository<InnovationConcept>,
    private readonly fileUploadsService: FileUploadsService,
    private readonly dataQueryService: DataQueryService,
  ) {}

  /**
   * Create a new Innovation Concept entry
   */
  async create(
    req: Request,
    createInnovationConceptDto: CreateInnovationConceptDto,
    file?: Express.Multer.File,
  ): Promise<InnovationConcept> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    let imageUrl: string | undefined;
    if (file) {
      const uploadedFiles = await this.fileUploadsService.fileUploads([file]);
      imageUrl = uploadedFiles[0];
    }

    const newConcept = this.innovationConceptRepository.create({
      ...createInnovationConceptDto,
      added_by: String(userId),
      image: imageUrl,
    });

    return this.innovationConceptRepository.save(newConcept);
  }

  /**
   * Get all Innovation Concept entries with optional filters/pagination
   */
  async findAll(
    query: GetInnovationConceptDto,
  ): Promise<IPagination<Partial<InnovationConcept>>> {
    return this.dataQueryService.execute<Partial<InnovationConcept>>({
      repository: this.innovationConceptRepository,
      alias: 'innovationConcept',
      pagination: query,
      searchableFields: ['name', 'description'],
      filterableFields: ['position', 'is_active'],
      relations: ['addedBy'],
      select: [
        'id',
        'name',
        'description',
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
   * Get all active Innovation Concepts, ordered for the public fleet page
   */
  async findActive(): Promise<InnovationConcept[]> {
    return this.innovationConceptRepository.find({
      where: { is_active: true },
      order: { position: 'ASC' },
    });
  }

  /**
   * Get a single Innovation Concept entry by UUID
   */
  async findOne(id: string): Promise<InnovationConcept> {
    const concept = await this.innovationConceptRepository.findOne({
      where: { id },
      relations: ['addedBy'],
    });

    if (!concept) throw new NotFoundException('Innovation concept not found.');

    return concept;
  }

  /**
   * Update an Innovation Concept entry
   */
  async update(
    id: string,
    updateInnovationConceptDto: UpdateInnovationConceptDto,
    file?: Express.Multer.File,
  ): Promise<InnovationConcept> {
    const concept = await this.findOne(id);

    if (file) {
      if (concept.image) {
        const updatedImage = await this.fileUploadsService.updateFileUploads({
          oldFile: concept.image,
          currentFile: file,
        });
        updateInnovationConceptDto.image = updatedImage as string;
      } else {
        const uploadedFiles = await this.fileUploadsService.fileUploads([
          file,
        ]);
        updateInnovationConceptDto.image = uploadedFiles[0];
      }
    }

    Object.assign(concept, updateInnovationConceptDto);
    return this.innovationConceptRepository.save(concept);
  }

  /**
   * Soft delete an Innovation Concept entry
   */
  async remove(id: string): Promise<void> {
    const concept = await this.findOne(id);

    if (concept.image) {
      try {
        await this.fileUploadsService.deleteFileUploads(concept.image);
      } catch (err) {
        if (err instanceof Error) {
          console.warn(
            `Failed to delete innovation concept image: ${err.message}`,
          );
        } else {
          console.warn('Failed to delete innovation concept image:', err);
        }
      }
    }

    const result = await this.innovationConceptRepository.softDelete(id);
    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: record might already be removed.',
      );
    }
  }
}
