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
import { VideoGallariesService } from './video-gallaries.service';
import {
  CreateVideoGallaryDto,
  VideoGallaryResponseDto,
} from './dto/create-video-gallary.dto';
import { UpdateVideoGallaryDto } from './dto/update-video-gallary.dto';
import { GetVideoGallaryDto } from './dto/get-video-gallary.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';

@Controller('video-gallaries')
export class VideoGallariesController {
  constructor(private readonly videoGallariesService: VideoGallariesService) {}

  @ApiDoc({
    summary: 'Create Video Gallary',
    description: 'Creates a new video gallary. Requires proper permission.',
    response: VideoGallaryResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('video-gallery', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(
    @Req() req: Request,
    @Body() createVideoGallaryDto: CreateVideoGallaryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.videoGallariesService.create(req, createVideoGallaryDto, file);
  }

  @ApiDoc({
    summary: 'Get all Video Gallaries',
    description:
      'Retrieves all video gallaries. Supports pagination and filters.',
    response: VideoGallaryResponseDto,
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetVideoGallaryDto) {
    return this.videoGallariesService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get single Video Gallary',
    description: 'Retrieve a single video gallary by UUID.',
    response: VideoGallaryResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.videoGallariesService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update Video Gallary',
    description:
      'Updates an existing video gallary. Requires proper permission.',
    response: VideoGallaryResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('video-gallery', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('thumbnail')) // <-- Fixed from 'image' to 'thumbnail'
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVideoGallaryDto: UpdateVideoGallaryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.videoGallariesService.update(id, updateVideoGallaryDto, file);
  }

  @ApiDoc({
    summary: 'Delete Video Gallary',
    description: 'Soft deletes a video gallary. Requires proper permission.',
    response: VideoGallaryResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('video-gallery', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.videoGallariesService.remove(id);
  }
}
