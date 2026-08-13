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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { VideoGallaryCategoriesService } from './video-gallary-categories.service';
import {
  CreateVideoGallaryCategoryDto,
  VideoGallaryCategoryResponseDto,
} from './dto/create-video-gallary-category.dto';
import { UpdateVideoGallaryCategoryDto } from './dto/update-video-gallary-category.dto';
import { GetVideoGallaryCategoryDto } from './dto/get-video-gallary-category.dto';

import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';

import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';

@Controller('video-gallary-categories')
export class VideoGallaryCategoriesController {
  constructor(
    private readonly videoGallaryCategoriesService: VideoGallaryCategoriesService,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */

  @ApiDoc({
    summary: 'Create Video Gallary Category',
    description:
      'Creates a new video gallery category. Requires proper permission.',
    response: VideoGallaryCategoryResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('video-gallery-category', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(@Req() req: Request, @Body() dto: CreateVideoGallaryCategoryDto) {
    return this.videoGallaryCategoriesService.create(req, dto);
  }

  /* -------------------------------------------------------------------------- */
  /*                                   FIND ALL                                 */
  /* -------------------------------------------------------------------------- */

  @ApiDoc({
    summary: 'Get all Video Gallary Categories',
    description:
      'Retrieves all video gallery categories with pagination and filters.',
    response: VideoGallaryCategoryResponseDto,
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetVideoGallaryCategoryDto) {
    return this.videoGallaryCategoriesService.findAll(query);
  }

  /* -------------------------------------------------------------------------- */
  /*                                   FIND ONE                                 */
  /* -------------------------------------------------------------------------- */

  @ApiDoc({
    summary: 'Get single Video Gallary Category',
    description: 'Retrieve a single video gallery category by UUID.',
    response: VideoGallaryCategoryResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.videoGallaryCategoriesService.findOne(id);
  }

  /* -------------------------------------------------------------------------- */
  /*                                   UPDATE                                   */
  /* -------------------------------------------------------------------------- */

  @ApiDoc({
    summary: 'Update Video Gallary Category',
    description:
      'Updates an existing video gallery category. Requires proper permission.',
    response: VideoGallaryCategoryResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('video-gallery-category', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVideoGallaryCategoryDto,
  ) {
    return this.videoGallaryCategoriesService.update(id, dto);
  }

  /* -------------------------------------------------------------------------- */
  /*                                   DELETE                                   */
  /* -------------------------------------------------------------------------- */

  @ApiDoc({
    summary: 'Delete Video Gallary Category',
    description:
      'Soft deletes a video gallery category. Requires proper permission.',
    response: VideoGallaryCategoryResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('video-gallery-category', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.videoGallaryCategoriesService.remove(id);
  }
}
