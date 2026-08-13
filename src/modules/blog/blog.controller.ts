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
  HttpStatus,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogResponseDto, CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { GetBlogsDto } from './dto/get-blogs.dto';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @ApiDoc({
    summary: 'Create Blog Post',
    description:
      'Creates a new blog post with an optional image upload. Requires proper permission.',
    response: BlogResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('blog', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(
    @Req() req: Request,
    @Body() createBlogDto: CreateBlogDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.blogService.create(req, createBlogDto, file);
  }

  @ApiDoc({
    summary: 'Get all Blog Posts',
    description: 'Retrieves all blog posts with pagination and filter support.',
    response: BlogResponseDto,
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetBlogsDto) {
    return this.blogService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get Blog Posts for Infinite Scroll',
    description:
      'Retrieves blog posts structured for infinite scrolling with has_more metadata.',
    response: BlogResponseDto,
    status: HttpStatus.OK,
  })
  @Get('infinite-scroll')
  findAllInfinite(@Query() query: GetBlogsDto) {
    return this.blogService.findAllInfinite(query);
  }

  @ApiDoc({
    summary: 'Get Single Blog Post by Slug',
    description: 'Retrieve a single blog post using its URL slug.',
    response: BlogResponseDto,
    status: HttpStatus.OK,
  })
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  @ApiDoc({
    summary: 'Get Single Blog Post',
    description: 'Retrieve a single blog post by numeric ID.',
    response: BlogResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update Blog Post',
    description:
      'Updates an existing blog post and optional cover image. Requires proper permission.',
    response: BlogResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('blog', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.blogService.update(id, updateBlogDto, file);
  }

  @ApiDoc({
    summary: 'Delete Blog Post',
    description: 'Deletes a blog post by ID. Requires proper permission.',
    response: BlogResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('blog', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
