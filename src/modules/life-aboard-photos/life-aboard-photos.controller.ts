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
import { LifeAboardPhotosService } from './life-aboard-photos.service';
import {
  CreateLifeAboardPhotoDto,
  LifeAboardPhotoResponseDto,
} from './dto/create-life-aboard-photo.dto';
import { UpdateLifeAboardPhotoDto } from './dto/update-life-aboard-photo.dto';
import { GetLifeAboardPhotoDto } from './dto/get-life-aboard-photo.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';

@Controller('life-aboard-photos')
export class LifeAboardPhotosController {
  constructor(
    private readonly lifeAboardPhotosService: LifeAboardPhotosService,
  ) {}

  @ApiDoc({
    summary: 'Create Life Aboard photo',
    description:
      'Creates a new Life Aboard photo entry. Requires proper permission.',
    response: LifeAboardPhotoResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('life-aboard-photos', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(
    @Req() req: Request,
    @Body() createLifeAboardPhotoDto: CreateLifeAboardPhotoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.lifeAboardPhotosService.create(
      req,
      createLifeAboardPhotoDto,
      file,
    );
  }

  @ApiDoc({
    summary: 'Get all Life Aboard photos',
    description:
      'Retrieves all Life Aboard photo entries. Supports pagination and filters.',
    response: LifeAboardPhotoResponseDto,
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetLifeAboardPhotoDto) {
    return this.lifeAboardPhotosService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get active Life Aboard photos',
    description:
      'Retrieves every active Life Aboard photo, ordered by position, for the public fleet page.',
    response: LifeAboardPhotoResponseDto,
    isArray: true,
    status: HttpStatus.OK,
  })
  @Get('active')
  findActive() {
    return this.lifeAboardPhotosService.findActive();
  }

  @ApiDoc({
    summary: 'Get single Life Aboard photo',
    description: 'Retrieve a single Life Aboard photo entry by UUID.',
    response: LifeAboardPhotoResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.lifeAboardPhotosService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update Life Aboard photo',
    description:
      'Updates an existing Life Aboard photo entry. Requires proper permission.',
    response: LifeAboardPhotoResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('life-aboard-photos', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLifeAboardPhotoDto: UpdateLifeAboardPhotoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.lifeAboardPhotosService.update(
      id,
      updateLifeAboardPhotoDto,
      file,
    );
  }

  @ApiDoc({
    summary: 'Delete Life Aboard photo',
    description:
      'Soft deletes a Life Aboard photo entry. Requires proper permission.',
    response: LifeAboardPhotoResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('life-aboard-photos', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.lifeAboardPhotosService.remove(id);
  }
}
