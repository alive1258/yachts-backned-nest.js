import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { BlogDetail } from './entities/blog-detail.entity';
import { CreateBlogDetailDto } from './dto/create-blog-detail.dto';
import { UpdateBlogDetailDto } from './dto/update-blog-detail.dto';
import { GetBlogDetailsDto } from './dto/get-blog-details.dto';
import { ReorderBlogDetailsDto } from './dto/reorder-blog-details.dto';
import { FileUploadsService } from 'src/common/file-uploads/file-uploads.service';

@Injectable()
export class BlogDetailsService {
  constructor(
    @InjectRepository(BlogDetail)
    private readonly blogDetailRepository: Repository<BlogDetail>,

    private readonly fileUploadsService: FileUploadsService,
  ) {}

  async create(
    req: Request,
    createBlogDetailDto: CreateBlogDetailDto,
    file?: Express.Multer.File,
  ): Promise<BlogDetail> {
    const user_id = String((req.user as any)?.sub ?? (req.user as any)?.id);

    let image: string | undefined;
    if (file) {
      const uploadedFiles = (await this.fileUploadsService.fileUploads([
        file,
      ])) as string[];
      image = uploadedFiles[0];
    }

    // Auto-assign position as max + 1 if not provided
    let position = createBlogDetailDto.position;
    if (position === undefined || position === null) {
      const maxResult = await this.blogDetailRepository
        .createQueryBuilder('d')
        .select('MAX(d.position)', 'max')
        .where('d.blog_id = :blog_id', {
          blog_id: String(createBlogDetailDto.blog_id),
        })
        .getRawOne();
      position = (Number(maxResult?.max) || 0) + 1;
    }

    const newDetail = this.blogDetailRepository.create({
      ...createBlogDetailDto,
      blog_id: String(createBlogDetailDto.blog_id),
      position,
      added_by: user_id,
      image,
    });

    return await this.blogDetailRepository.save(newDetail);
  }

  async findAll(
    getBlogDetailsDto: GetBlogDetailsDto,
  ): Promise<{ meta: any; data: BlogDetail[] }> {
    const {
      page = 1,
      limit = 50,
      search,
      sort_by = 'position',
      sort_order = 'ASC',
      ...filters
    } = getBlogDetailsDto;

    const qb = this.blogDetailRepository
      .createQueryBuilder('detail')
      .leftJoinAndSelect('detail.blog', 'blog');

    if (filters.blog_id) {
      qb.andWhere('detail.blog_id = :blog_id', {
        blog_id: String(filters.blog_id),
      });
    }

    if (filters.added_by) {
      qb.andWhere('detail.added_by = :added_by', {
        added_by: String(filters.added_by),
      });
    }

    if (filters.status !== undefined && filters.status !== null) {
      qb.andWhere('detail.status = :status', { status: filters.status });
    }

    if (search) {
      qb.andWhere(
        '(detail.heading ILIKE :search OR detail.body ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy(
      `detail.${sort_by}`,
      sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
    );

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
      data,
    };
  }

  /* Get all sections of a single blog, sorted by position */
  async findByBlog(blog_id: string | number): Promise<BlogDetail[]> {
    if (!blog_id) {
      throw new BadRequestException('Blog ID is required!');
    }

    return await this.blogDetailRepository.find({
      where: { blog_id: String(blog_id), status: true },
      order: { position: 'ASC' },
    });
  }

  async findOne(id: string): Promise<BlogDetail> {
    if (!id) {
      throw new BadRequestException('Blog detail ID is required!');
    }

    const detail = await this.blogDetailRepository.findOne({
      where: { id },
      relations: ['blog'],
    });

    if (!detail) {
      throw new NotFoundException('Blog detail not found.');
    }

    return detail;
  }

  async update(
    id: string,
    updateBlogDetailDto: UpdateBlogDetailDto,
    file?: Express.Multer.File,
  ): Promise<BlogDetail> {
    const existing = await this.blogDetailRepository.findOneBy({ id });

    if (!existing) {
      throw new NotFoundException('Blog detail not found.');
    }

    let image: string | undefined;
    if (file && existing.image) {
      image = (await this.fileUploadsService.updateFileUploads({
        currentFile: file,
        oldFile: existing.image,
      })) as string;
    } else if (file && !existing.image) {
      const uploadedFiles = (await this.fileUploadsService.fileUploads([
        file,
      ])) as string[];
      image = uploadedFiles[0];
    }

    Object.assign(existing, {
      ...updateBlogDetailDto,
      ...(updateBlogDetailDto.blog_id
        ? { blog_id: String(updateBlogDetailDto.blog_id) }
        : {}),
    });

    return await this.blogDetailRepository.save({
      ...existing,
      ...(image ? { image } : {}),
    });
  }

  /* Bulk reorder — frontend sends [{id, position}] */
  async reorder(
    reorderDto: ReorderBlogDetailsDto,
  ): Promise<{ success: boolean }> {
    const updates = reorderDto.items.map((item) =>
      this.blogDetailRepository.update(String(item.id), {
        position: item.position,
      }),
    );
    await Promise.all(updates);
    return { success: true };
  }

  async remove(id: string) {
    const existing = await this.blogDetailRepository.findOneBy({ id });

    if (!existing) {
      throw new NotFoundException('Blog detail not found.');
    }

    if (existing.image) {
      await this.fileUploadsService.deleteFileUploads(existing.image);
    }

    return await this.blogDetailRepository.delete(id);
  }

  /* Delete all sections of a blog (called when the blog itself is deleted) */
  async removeAllByBlog(blog_id: string | number): Promise<void> {
    const details = await this.blogDetailRepository.find({
      where: { blog_id: String(blog_id) },
    });

    for (const d of details) {
      if (d.image) {
        await this.fileUploadsService.deleteFileUploads(d.image);
      }
    }

    await this.blogDetailRepository.delete({ blog_id: String(blog_id) });
  }
}
