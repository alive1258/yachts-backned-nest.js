import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { About } from './entities/about.entity';
import { CreateAboutDto } from './dto/create-about.dto';
import { UpdateAboutDto } from './dto/update-about.dto';
import { GetAboutDto } from './dto/get-about.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { DataQueryService } from 'src/common/data-query/data-query.service';
import { FileUploadsService } from 'src/common/file-uploads/file-uploads.service';

@Injectable()
export class AboutService {
  constructor(
    @InjectRepository(About)
    private readonly aboutRepository: Repository<About>,
    private readonly fileUploadsService: FileUploadsService,
    private readonly dataQueryService: DataQueryService,
  ) {}

  /**
   * Create a new about section entry
   */
  async create(
    req: Request,
    createAboutDto: CreateAboutDto,
    file?: Express.Multer.File,
  ): Promise<About> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    let imageUrl: string | undefined;
    if (file) {
      const uploadedFiles = await this.fileUploadsService.fileUploads([file]);
      imageUrl = uploadedFiles[0];
    }

    const newAbout = this.aboutRepository.create({
      ...createAboutDto,
      added_by: String(userId),
      image: imageUrl,
    });

    return this.aboutRepository.save(newAbout);
  }

  /**
   * Get all about entries with optional filters/pagination
   */
  async findAll(query: GetAboutDto): Promise<IPagination<Partial<About>>> {
    return this.dataQueryService.execute<Partial<About>>({
      repository: this.aboutRepository,
      alias: 'about',
      pagination: query,
      searchableFields: ['name', 'title', 'specialty'],
      filterableFields: ['position', 'is_active'],
      relations: ['addedBy'],
      select: [
        'id',
        'eyebrow',
        'name',
        'title',
        'specialty',
        'bio',
        'info',
        'registration',
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
   * Get the currently active about entry (for the public homepage)
   */
  async findActive(): Promise<About> {
    const about = await this.aboutRepository.findOne({
      where: { is_active: true },
      order: { position: 'ASC' },
    });

    if (!about) {
      throw new NotFoundException('No active about section found.');
    }

    return about;
  }

  /**
   * Get a single about entry by UUID
   */
  async findOne(id: string): Promise<About> {
    const about = await this.aboutRepository.findOne({
      where: { id },
      relations: ['addedBy'],
    });

    if (!about) throw new NotFoundException('About section not found.');

    return about;
  }

  /**
   * Update an about entry
   */
  async update(
    id: string,
    updateAboutDto: UpdateAboutDto,
    file?: Express.Multer.File,
  ): Promise<About> {
    const about = await this.findOne(id);

    if (file) {
      if (about.image) {
        const updatedImage = await this.fileUploadsService.updateFileUploads({
          oldFile: about.image,
          currentFile: file,
        });
        updateAboutDto.image = updatedImage as string;
      } else {
        const uploadedFiles = await this.fileUploadsService.fileUploads([file]);
        updateAboutDto.image = uploadedFiles[0];
      }
    }

    Object.assign(about, updateAboutDto);
    return this.aboutRepository.save(about);
  }

  /**
   * Soft delete an about entry
   */
  async remove(id: string): Promise<void> {
    const about = await this.findOne(id);

    if (about.image) {
      try {
        await this.fileUploadsService.deleteFileUploads(about.image);
      } catch (err) {
        if (err instanceof Error) {
          console.warn(`Failed to delete about image: ${err.message}`);
        } else {
          console.warn('Failed to delete about image:', err);
        }
      }
    }

    const result = await this.aboutRepository.softDelete(id);
    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: record might already be removed.',
      );
    }
  }
}
