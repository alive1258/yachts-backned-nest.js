import { Request } from 'express';
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { DataQueryService } from 'src/common/data-query/data-query.service';
import { IPagination } from 'src/common/data-query/pagination.interface';

import { BlogCategory } from './entities/blog-category.entity';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';
import { GetBlogCategoriesDto } from './dto/get-blog-categories.dto';

@Injectable()
export class BlogCategoryService {
  constructor(
    @InjectRepository(BlogCategory)
    private readonly blogCategoryRepository: Repository<BlogCategory>,
    private readonly dataQueryService: DataQueryService,
  ) {}

  // ---------------- CREATE ----------------
  async create(
    req: Request,
    createDto: CreateBlogCategoryDto,
  ): Promise<BlogCategory> {
    const userId = (req as any)?.user?.sub || (req as any)?.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Authentication required. You must be signed in to create a blog category.',
      );
    }

    const categoryName = createDto.category_name.trim();

    const exists = await this.blogCategoryRepository.exists({
      where: { category_name: categoryName },
    });
    if (exists) {
      throw new BadRequestException(
        `Blog category "${categoryName}" already exists.`,
      );
    }

    const newCategory = this.blogCategoryRepository.create({
      ...createDto,
      category_name: categoryName,
      added_by: userId,
    });

    return await this.blogCategoryRepository.save(newCategory);
  }

  // ---------------- FIND ALL ----------------
  async findAll(
    query?: GetBlogCategoriesDto,
  ): Promise<IPagination<Partial<BlogCategory>>> {
    return this.dataQueryService.execute<Partial<BlogCategory>>({
      repository: this.blogCategoryRepository,
      alias: 'blogCategory',
      pagination: query ?? new GetBlogCategoriesDto(),
      searchableFields: ['category_name', 'description'],
      select: [
        'id',
        'category_name',
        'description',
        'status',
        'created_at',
        'updated_at',
      ],
      relations: ['added_by_user'],
    });
  }

  // ---------------- FIND ONE ----------------
  async findOne(id: string): Promise<BlogCategory> {
    const category = await this.blogCategoryRepository.findOne({
      where: { id: id.toString() },
      relations: ['added_by_user'],
    });

    if (!category) {
      throw new NotFoundException(`Blog category not found`);
    }

    return category;
  }

  // ---------------- UPDATE ----------------
  async update(
    id: string,
    updateDto: UpdateBlogCategoryDto,
  ): Promise<BlogCategory> {
    const category = await this.findOne(id);

    if (updateDto.category_name) {
      const trimmedName = updateDto.category_name.trim();

      const exists = await this.blogCategoryRepository.exists({
        where: { category_name: trimmedName, id: Not(id.toString()) },
      });
      if (exists) {
        throw new BadRequestException(
          `Blog category name "${trimmedName}" is already in use.`,
        );
      }

      category.category_name = trimmedName;
    }

    Object.assign(category, updateDto);
    return await this.blogCategoryRepository.save(category);
  }

  // ---------------- DELETE (HARD) ----------------
  async remove(id: string): Promise<void> {
    const result = await this.blogCategoryRepository.delete(id.toString());
    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: Record not found or already deleted.',
      );
    }
  }
}
