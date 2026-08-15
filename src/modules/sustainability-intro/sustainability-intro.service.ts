import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { SustainabilityIntro } from './entities/sustainability-intro.entity';
import { CreateSustainabilityIntroDto } from './dto/create-sustainability-intro.dto';
import { UpdateSustainabilityIntroDto } from './dto/update-sustainability-intro.dto';
import { GetSustainabilityIntroDto } from './dto/get-sustainability-intro.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { DataQueryService } from 'src/common/data-query/data-query.service';
import { FileUploadsService } from 'src/common/file-uploads/file-uploads.service';

@Injectable()
export class SustainabilityIntroService {
  constructor(
    @InjectRepository(SustainabilityIntro)
    private readonly sustainabilityIntroRepository: Repository<SustainabilityIntro>,
    private readonly fileUploadsService: FileUploadsService,
    private readonly dataQueryService: DataQueryService,
  ) {}

  /**
   * Create a new Sustainability Intro entry
   */
  async create(
    req: Request,
    createSustainabilityIntroDto: CreateSustainabilityIntroDto,
    file?: Express.Multer.File,
  ): Promise<SustainabilityIntro> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    let imageUrl: string | undefined;
    if (file) {
      const uploadedFiles = await this.fileUploadsService.fileUploads([file]);
      imageUrl = uploadedFiles[0];
    }

    const newIntro = this.sustainabilityIntroRepository.create({
      ...createSustainabilityIntroDto,
      added_by: String(userId),
      image: imageUrl,
    });

    return this.sustainabilityIntroRepository.save(newIntro);
  }

  /**
   * Get all Sustainability Intro entries with optional filters/pagination
   */
  async findAll(
    query: GetSustainabilityIntroDto,
  ): Promise<IPagination<Partial<SustainabilityIntro>>> {
    return this.dataQueryService.execute<Partial<SustainabilityIntro>>({
      repository: this.sustainabilityIntroRepository,
      alias: 'sustainabilityIntro',
      pagination: query,
      searchableFields: ['heading', 'eyebrow'],
      filterableFields: ['position', 'is_active'],
      relations: ['addedBy'],
      select: [
        'id',
        'eyebrow',
        'heading',
        'paragraphs',
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
   * Get the currently active Sustainability Intro (for the public sustainability page)
   */
  async findActive(): Promise<SustainabilityIntro> {
    const intro = await this.sustainabilityIntroRepository.findOne({
      where: { is_active: true },
      order: { position: 'ASC' },
    });

    if (!intro) {
      throw new NotFoundException('No active Sustainability Intro found.');
    }

    return intro;
  }

  /**
   * Get a single Sustainability Intro entry by UUID
   */
  async findOne(id: string): Promise<SustainabilityIntro> {
    const intro = await this.sustainabilityIntroRepository.findOne({
      where: { id },
      relations: ['addedBy'],
    });

    if (!intro) throw new NotFoundException('Sustainability Intro not found.');

    return intro;
  }

  /**
   * Update a Sustainability Intro entry
   */
  async update(
    id: string,
    updateSustainabilityIntroDto: UpdateSustainabilityIntroDto,
    file?: Express.Multer.File,
  ): Promise<SustainabilityIntro> {
    const intro = await this.findOne(id);

    if (file) {
      if (intro.image) {
        const updatedImage = await this.fileUploadsService.updateFileUploads({
          oldFile: intro.image,
          currentFile: file,
        });
        updateSustainabilityIntroDto.image = updatedImage as string;
      } else {
        const uploadedFiles = await this.fileUploadsService.fileUploads([
          file,
        ]);
        updateSustainabilityIntroDto.image = uploadedFiles[0];
      }
    }

    Object.assign(intro, updateSustainabilityIntroDto);
    return this.sustainabilityIntroRepository.save(intro);
  }

  /**
   * Soft delete a Sustainability Intro entry
   */
  async remove(id: string): Promise<void> {
    const intro = await this.findOne(id);

    if (intro.image) {
      try {
        await this.fileUploadsService.deleteFileUploads(intro.image);
      } catch (err) {
        if (err instanceof Error) {
          console.warn(
            `Failed to delete Sustainability Intro image: ${err.message}`,
          );
        } else {
          console.warn('Failed to delete Sustainability Intro image:', err);
        }
      }
    }

    const result = await this.sustainabilityIntroRepository.softDelete(id);
    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: record might already be removed.',
      );
    }
  }
}
