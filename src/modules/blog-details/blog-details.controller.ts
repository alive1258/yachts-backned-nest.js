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
import { BlogDetailsService } from './blog-details.service';
import { CreateBlogDetailDto } from './dto/create-blog-detail.dto';
import { UpdateBlogDetailDto } from './dto/update-blog-detail.dto';
import { GetBlogDetailsDto } from './dto/get-blog-details.dto';
import { ReorderBlogDetailsDto } from './dto/reorder-blog-details.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';

@Controller('blog-details')
export class BlogDetailsController {
  constructor(private readonly blogDetailsService: BlogDetailsService) {}

  @ApiDoc({
    summary: 'Create Blog Section',
    description:
      'Creates a new blog detail section with an optional image upload. Requires proper permission.',
    status: HttpStatus.OK,
  })
  @RequirePermission('blog-details', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(
    @Req() req: Request,
    @Body() createBlogDetailDto: CreateBlogDetailDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.blogDetailsService.create(req, createBlogDetailDto, file);
  }

  @ApiDoc({
    summary: 'Get all Blog Sections',
    description:
      'Retrieves all blog sections with pagination and filter support.',
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetBlogDetailsDto) {
    return this.blogDetailsService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get Blog Sections by Blog ID',
    description:
      'Retrieves all detail sections belonging to a specific blog post.',
    status: HttpStatus.OK,
  })
  @Get('by-blog/:blog_id')
  findByBlog(@Param('blog_id') blogId: string) {
    return this.blogDetailsService.findByBlog(blogId);
  }

  @ApiDoc({
    summary: 'Reorder Blog Sections',
    description: 'Updates display order positions for blog sections.',
    status: HttpStatus.OK,
  })
  @RequirePermission('blog-details', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch('reorder')
  reorder(@Body() reorderDto: ReorderBlogDetailsDto) {
    return this.blogDetailsService.reorder(reorderDto);
  }

  @ApiDoc({
    summary: 'Get Single Blog Section',
    description: 'Retrieve a single blog section by numeric ID.',
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogDetailsService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update Blog Section',
    description:
      'Updates an existing blog section and optional cover image. Requires proper permission.',
    status: HttpStatus.OK,
  })
  @RequirePermission('blog-details', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBlogDetailDto: UpdateBlogDetailDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.blogDetailsService.update(id, updateBlogDetailDto, file);
  }

  @ApiDoc({
    summary: 'Delete Blog Section',
    description:
      'Deletes a blog section by numeric ID. Requires proper permission.',
    status: HttpStatus.OK,
  })
  @RequirePermission('blog-details', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogDetailsService.remove(id);
  }
}
