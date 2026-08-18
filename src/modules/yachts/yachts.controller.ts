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
import { YachtsService } from './yachts.service';
import type { YachtUploadFiles } from './yachts.service';
import { CreateYachtDto, YachtResponseDto } from './dto/create-yacht.dto';
import { UpdateYachtDto } from './dto/update-yacht.dto';
import { GetYachtDto } from './dto/get-yacht.dto';
import { SearchActiveYachtsDto } from './dto/search-active-yachts.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';

const MAX_GALLERY_IMAGES = 12;

const YACHT_FILE_FIELDS = FileFieldsInterceptor([
  { name: 'heroImage', maxCount: 1 },
  { name: 'gallery', maxCount: MAX_GALLERY_IMAGES },
]);

@Controller('yachts')
export class YachtsController {
  constructor(private readonly yachtsService: YachtsService) {}

  @ApiDoc({
    summary: 'Create Yacht',
    description:
      'Creates a new yacht entry with a hero image and optional gallery images. Requires proper permission.',
    response: YachtResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('yachts', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(YACHT_FILE_FIELDS)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(
    @Req() req: Request,
    @Body() createYachtDto: CreateYachtDto,
    @UploadedFiles() files?: YachtUploadFiles,
  ) {
    return this.yachtsService.create(req, createYachtDto, files);
  }

  @ApiDoc({
    summary: 'Get all Yachts',
    description: 'Retrieves all yacht entries. Supports pagination and filters.',
    response: YachtResponseDto,
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetYachtDto) {
    return this.yachtsService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get active Yachts',
    description:
      'Retrieves every active yacht, ordered by position, for the public fleet page. Supports optional region and guests_min filters for the site search.',
    response: YachtResponseDto,
    isArray: true,
    status: HttpStatus.OK,
  })
  @Get('active')
  findActive(@Query() query: SearchActiveYachtsDto) {
    return this.yachtsService.findActive(query);
  }

  @ApiDoc({
    summary: 'Get active cruising regions',
    description:
      'Retrieves the distinct cruising regions across active yachts, for populating the site search destination options.',
    status: HttpStatus.OK,
  })
  @Get('regions')
  findRegions() {
    return this.yachtsService.findActiveRegions();
  }

  @ApiDoc({
    summary: 'Get single Yacht by slug',
    description: 'Retrieve a single active yacht by its URL slug.',
    response: YachtResponseDto,
    status: HttpStatus.OK,
  })
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.yachtsService.findBySlug(slug);
  }

  @ApiDoc({
    summary: 'Get single Yacht',
    description: 'Retrieve a single yacht entry by UUID.',
    response: YachtResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.yachtsService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update Yacht',
    description:
      'Updates an existing yacht entry. Uploading a hero image or gallery images replaces the existing ones. Requires proper permission.',
    response: YachtResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('yachts', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(YACHT_FILE_FIELDS)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateYachtDto: UpdateYachtDto,
    @UploadedFiles() files?: YachtUploadFiles,
  ) {
    return this.yachtsService.update(id, updateYachtDto, files);
  }

  @ApiDoc({
    summary: 'Delete Yacht',
    description: 'Soft deletes a yacht entry. Requires proper permission.',
    response: YachtResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('yachts', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.yachtsService.remove(id);
  }
}
