import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { GetServiceDto } from './dto/get-service.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { DataQueryService } from 'src/common/data-query/data-query.service';
import { FileUploadsService } from 'src/common/file-uploads/file-uploads.service';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly fileUploadsService: FileUploadsService,
    private readonly dataQueryService: DataQueryService,
  ) {}

  /**
   * Create a new service entry
   */
  async create(
    req: Request,
    createServiceDto: CreateServiceDto,
    file?: Express.Multer.File,
  ): Promise<Service> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    let imageUrl: string | undefined;
    if (file) {
      const uploadedFiles = await this.fileUploadsService.fileUploads([file]);
      imageUrl = uploadedFiles[0];
    }

    const newService = this.serviceRepository.create({
      ...createServiceDto,
      added_by: String(userId),
      image: imageUrl,
    });

    return this.serviceRepository.save(newService);
  }

  /**
   * Get all service entries with optional filters/pagination
   */
  async findAll(query: GetServiceDto): Promise<IPagination<Partial<Service>>> {
    return this.dataQueryService.execute<Partial<Service>>({
      repository: this.serviceRepository,
      alias: 'service',
      pagination: query,
      searchableFields: ['title', 'description'],
      filterableFields: ['position', 'is_active'],
      relations: ['addedBy'],
      select: [
        'id',
        'title',
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
   * Get all active services, ordered for the public homepage
   */
  async findActive(): Promise<Service[]> {
    return this.serviceRepository.find({
      where: { is_active: true },
      order: { position: 'ASC' },
    });
  }

  /**
   * Get a single service entry by UUID
   */
  async findOne(id: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['addedBy'],
    });

    if (!service) throw new NotFoundException('Service not found.');

    return service;
  }

  /**
   * Update a service entry
   */
  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
    file?: Express.Multer.File,
  ): Promise<Service> {
    const service = await this.findOne(id);

    if (file) {
      if (service.image) {
        const updatedImage = await this.fileUploadsService.updateFileUploads({
          oldFile: service.image,
          currentFile: file,
        });
        updateServiceDto.image = updatedImage as string;
      } else {
        const uploadedFiles = await this.fileUploadsService.fileUploads([file]);
        updateServiceDto.image = uploadedFiles[0];
      }
    }

    Object.assign(service, updateServiceDto);
    return this.serviceRepository.save(service);
  }

  /**
   * Soft delete a service entry
   */
  async remove(id: string): Promise<void> {
    const service = await this.findOne(id);

    if (service.image) {
      try {
        await this.fileUploadsService.deleteFileUploads(service.image);
      } catch (err) {
        if (err instanceof Error) {
          console.warn(`Failed to delete service image: ${err.message}`);
        } else {
          console.warn('Failed to delete service image:', err);
        }
      }
    }

    const result = await this.serviceRepository.softDelete(id);
    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: record might already be removed.',
      );
    }
  }
}
