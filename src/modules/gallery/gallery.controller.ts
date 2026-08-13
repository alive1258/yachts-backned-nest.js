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
  ParseUUIDPipe,
  HttpStatus,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { GalleryService } from './gallery.service';
import {
  CreateGalleryItemDto,
  GalleryItemResponseDto,
} from './dto/create-gallery-item.dto';
import { UpdateGalleryItemDto } from './dto/update-gallery-item.dto';
import { GetGalleryItemDto } from './dto/get-gallery-item.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';

const MAX_GALLERY_IMAGES = 10;

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @ApiDoc({
    summary: 'Create Gallery Item',
    description:
      'Creates a new gallery item with one or more images. Requires proper permission.',
    response: GalleryItemResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('gallery', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FilesInterceptor('images', MAX_GALLERY_IMAGES))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(
    @Req() req: Request,
    @Body() createGalleryItemDto: CreateGalleryItemDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.galleryService.create(req, createGalleryItemDto, files);
  }

  @ApiDoc({
    summary: 'Get all Gallery Items',
    description: 'Retrieves all gallery items. Supports pagination and filters.',
    response: GalleryItemResponseDto,
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetGalleryItemDto) {
    return this.galleryService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get active Gallery Items',
    description:
      'Retrieves all active gallery items, ordered by position, for the public homepage.',
    response: GalleryItemResponseDto,
    status: HttpStatus.OK,
  })
  @Get('active')
  findActive() {
    return this.galleryService.findActive();
  }

  @ApiDoc({
    summary: 'Get single Gallery Item',
    description: 'Retrieve a single gallery item by UUID.',
    response: GalleryItemResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.galleryService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update Gallery Item',
    description:
      'Updates an existing gallery item. Uploading new images replaces the existing set. Requires proper permission.',
    response: GalleryItemResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('gallery', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FilesInterceptor('images', MAX_GALLERY_IMAGES))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGalleryItemDto: UpdateGalleryItemDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.galleryService.update(id, updateGalleryItemDto, files);
  }

  @ApiDoc({
    summary: 'Delete Gallery Item',
    description: 'Soft deletes a gallery item. Requires proper permission.',
    response: GalleryItemResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('gallery', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.galleryService.remove(id);
  }
}
