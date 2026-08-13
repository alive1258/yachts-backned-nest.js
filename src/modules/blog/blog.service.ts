import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Request } from 'express';
import { Blog } from './entities/blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { GetBlogsDto } from './dto/get-blogs.dto';
import { FileUploadsService } from 'src/common/file-uploads/file-uploads.service';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { DataQueryService } from 'src/common/data-query/data-query.service';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,

    private readonly fileUploadsService: FileUploadsService,
    private readonly dataQueryService: DataQueryService,
  ) {}

  async create(
    req: Request,
    createBlogDto: CreateBlogDto,
    file?: Express.Multer.File,
  ): Promise<Blog> {
    const user_id = (req.user as any)?.sub;

    let image: string | undefined;
    if (file) {
      // Pass [file] as an array and take the first uploaded item
      const uploadedFiles = (await this.fileUploadsService.fileUploads([
        file,
      ])) as string[];
      image = uploadedFiles[0];
    }

    const newBlog = this.blogRepository.create({
      ...createBlogDto,
      added_by: user_id,
      image,
    });

    return await this.blogRepository.save(newBlog);
  }

  async findAll(getBlogsDto: GetBlogsDto): Promise<IPagination<Blog>> {
    // Extract pagination and filters
    const { search, page, limit, ...filters } = getBlogsDto;

    const result = await this.dataQueryService.execute<Blog>({
      repository: this.blogRepository,
      alias: 'blog',
      pagination: {
        ...getBlogsDto,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        search,
        filters, // Pass status, is_featured, category_id, added_by inside filters
      },
      // Automatically perform ILIKE across these fields
      searchableFields: ['title', 'excerpt', 'author_name'],
      // Automatically apply exact match on these entity keys from `filters`
      filterableFields: ['status', 'is_featured', 'category_id', 'added_by'],
      relations: ['category'],
      select: [
        'id',
        'title',
        'slug',
        'author_name',
        'content',
        'excerpt',
        'image',
        'category_id',
        'status',
        'is_featured',
        'position',
        'read_time',
        'meta_title',
        'meta_keywords',
        'meta_description',
        'added_by',
        'created_at',
        'updated_at',
      ],
      selectRelations: [
        'category.id',
        'category.category_name',
        'category.slug',
        'category.status',
      ],
    });

    if (!result.data.length) {
      throw new NotFoundException('No blog posts found.');
    }

    return result;
  }
  async findAllInfinite(
    getBlogsDto: GetBlogsDto,
  ): Promise<{ meta: any; data: Blog[] }> {
    const { page = 1, limit = 9, search, ...filters } = getBlogsDto;

    const qb = this.blogRepository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.category', 'category');

    if (filters.status !== undefined && filters.status !== null) {
      qb.andWhere('blog.status = :status', { status: filters.status });
    }

    if (filters.is_featured !== undefined && filters.is_featured !== null) {
      qb.andWhere('blog.is_featured = :is_featured', {
        is_featured: filters.is_featured,
      });
    }

    if (filters.category_id) {
      qb.andWhere('blog.category_id = :category_id', {
        category_id: filters.category_id,
      });
    }

    if (search) {
      qb.andWhere(
        '(blog.title ILIKE :search OR blog.excerpt ILIKE :search OR blog.author_name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('blog.position', 'ASC').addOrderBy('blog.created_at', 'DESC');

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages,
        has_more: Number(page) < totalPages,
      },
      data,
    };
  }

  async findOne(id: string): Promise<Blog> {
    if (!id) {
      throw new BadRequestException('Blog ID is required!');
    }

    const blog = await this.blogRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!blog) {
      throw new NotFoundException('Blog not found.');
    }

    return blog;
  }

  async findBySlug(slug: string): Promise<Blog> {
    if (!slug) {
      throw new BadRequestException('Slug is required!');
    }

    const blog = await this.blogRepository.findOne({
      where: { slug },
      relations: ['category'],
    });

    if (!blog) {
      throw new NotFoundException('Blog not found.');
    }

    return blog;
  }

  // blog.service.ts

  async update(
    id: string,
    updateBlogDto: UpdateBlogDto,
    file?: Express.Multer.File,
  ): Promise<Blog> {
    const existing = await this.blogRepository.findOneBy({ id });

    if (!existing) {
      throw new NotFoundException('Blog not found.');
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

    // Merge updated values
    Object.assign(existing, updateBlogDto);
    if (image) {
      existing.image = image;
    }

    await this.blogRepository.save(existing);

    // Return fresh record with relations
    return await this.findOne(id);
  }

  async remove(id: string) {
    const existing = await this.blogRepository.findOneBy({ id });

    if (!existing) {
      throw new NotFoundException('Blog not found.');
    }

    if (existing.image) {
      await this.fileUploadsService.deleteFileUploads(existing.image);
    }

    return await this.blogRepository.delete(id);
  }
}
