import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  ParseIntPipe,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { BlogCategoryService } from './blog-category.service';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { GetBlogCategoriesDto } from './dto/get-blog-categories.dto';

@Controller('blog-category')
export class BlogCategoryController {
  constructor(private readonly blogCategoryService: BlogCategoryService) {}

  @ApiDoc({
    summary: 'Create Blog Category',
    description: 'Creates a new blog category. Requires proper permission.',
    response: GetBlogCategoriesDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('blog-category', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(
    @Req() req: Request,
    @Body() createBlogCategoryDto: CreateBlogCategoryDto,
  ) {
    return this.blogCategoryService.create(req, createBlogCategoryDto);
  }

  @ApiDoc({
    summary: 'Get all Blog Categories',
    description:
      'Retrieves all blog categories. Supports pagination and filters.',
    response: GetBlogCategoriesDto,
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetBlogCategoriesDto) {
    return this.blogCategoryService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get single Blog Category',
    description: 'Retrieve a single blog category by ID.',
    response: GetBlogCategoriesDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.blogCategoryService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update Blog Category',
    description:
      'Updates an existing blog category. Requires proper permission.',
    response: GetBlogCategoriesDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('blog-category', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBlogCategoryDto: UpdateBlogCategoryDto,
  ) {
    return this.blogCategoryService.update(id, updateBlogCategoryDto);
  }

  @ApiDoc({
    summary: 'Delete Blog Category',
    description: 'Deletes a blog category. Requires proper permission.',
    response: GetBlogCategoriesDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('blog-category', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.blogCategoryService.remove(id);
  }
}
