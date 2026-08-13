import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { Destination } from './entities/destination.entity';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';
import { GetDestinationDto } from './dto/get-destination.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { DataQueryService } from 'src/common/data-query/data-query.service';
import { FileUploadsService } from 'src/common/file-uploads/file-uploads.service';

@Injectable()
export class DestinationsService {
  constructor(
    @InjectRepository(Destination)
    private readonly destinationRepository: Repository<Destination>,
    private readonly fileUploadsService: FileUploadsService,
    private readonly dataQueryService: DataQueryService,
  ) {}

  /**
   * Create a new destination entry
   */
  async create(
    req: Request,
    createDestinationDto: CreateDestinationDto,
    file?: Express.Multer.File,
  ): Promise<Destination> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    let imageUrl: string | undefined;
    if (file) {
      const uploadedFiles = await this.fileUploadsService.fileUploads([file]);
      imageUrl = uploadedFiles[0];
    }

    const newDestination = this.destinationRepository.create({
      ...createDestinationDto,
      added_by: String(userId),
      image: imageUrl,
    });

    return this.destinationRepository.save(newDestination);
  }

  /**
   * Get all destination entries with optional filters/pagination
   */
  async findAll(
    query: GetDestinationDto,
  ): Promise<IPagination<Partial<Destination>>> {
    return this.dataQueryService.execute<Partial<Destination>>({
      repository: this.destinationRepository,
      alias: 'destination',
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
   * Get all currently active destinations (for the public site), ordered
   */
  async findActive(): Promise<Destination[]> {
    return this.destinationRepository.find({
      where: { is_active: true },
      order: { position: 'ASC' },
    });
  }

  /**
   * Get a single destination entry by UUID
   */
  async findOne(id: string): Promise<Destination> {
    const destination = await this.destinationRepository.findOne({
      where: { id },
      relations: ['addedBy'],
    });

    if (!destination) throw new NotFoundException('Destination not found.');

    return destination;
  }

  /**
   * Update a destination entry
   */
  async update(
    id: string,
    updateDestinationDto: UpdateDestinationDto,
    file?: Express.Multer.File,
  ): Promise<Destination> {
    const destination = await this.findOne(id);

    if (file) {
      if (destination.image) {
        const updatedImage = await this.fileUploadsService.updateFileUploads({
          oldFile: destination.image,
          currentFile: file,
        });
        updateDestinationDto.image = updatedImage as string;
      } else {
        const uploadedFiles = await this.fileUploadsService.fileUploads([
          file,
        ]);
        updateDestinationDto.image = uploadedFiles[0];
      }
    }

    Object.assign(destination, updateDestinationDto);
    return this.destinationRepository.save(destination);
  }

  /**
   * Soft delete a destination entry
   */
  async remove(id: string): Promise<void> {
    const destination = await this.findOne(id);

    if (destination.image) {
      try {
        await this.fileUploadsService.deleteFileUploads(destination.image);
      } catch (err) {
        if (err instanceof Error) {
          console.warn(`Failed to delete destination image: ${err.message}`);
        } else {
          console.warn('Failed to delete destination image:', err);
        }
      }
    }

    const result = await this.destinationRepository.softDelete(id);
    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: record might already be removed.',
      );
    }
  }
}
