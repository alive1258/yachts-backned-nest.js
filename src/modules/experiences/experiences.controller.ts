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
import { ExperiencesService } from './experiences.service';
import {
  CreateExperienceDto,
  ExperienceResponseDto,
} from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { GetExperienceDto } from './dto/get-experience.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';

@Controller('experiences')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @ApiDoc({
    summary: 'Create Experience',
    description: 'Creates a new experience entry. Requires proper permission.',
    response: ExperienceResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('experiences', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(
    @Req() req: Request,
    @Body() createExperienceDto: CreateExperienceDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.experiencesService.create(req, createExperienceDto, file);
  }

  @ApiDoc({
    summary: 'Get all Experience entries',
    description:
      'Retrieves all experience entries. Supports pagination and filters.',
    response: ExperienceResponseDto,
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetExperienceDto) {
    return this.experiencesService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get all active Experiences',
    description:
      'Retrieves every active experience, ordered by position, for the public site.',
    response: ExperienceResponseDto,
    isArray: true,
    status: HttpStatus.OK,
  })
  @Get('active')
  findActive() {
    return this.experiencesService.findActive();
  }

  @ApiDoc({
    summary: 'Get single Experience entry',
    description: 'Retrieve a single experience entry by UUID.',
    response: ExperienceResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.experiencesService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update Experience entry',
    description:
      'Updates an existing experience entry. Requires proper permission.',
    response: ExperienceResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('experiences', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExperienceDto: UpdateExperienceDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.experiencesService.update(id, updateExperienceDto, file);
  }

  @ApiDoc({
    summary: 'Delete Experience entry',
    description: 'Soft deletes an experience entry. Requires proper permission.',
    response: ExperienceResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('experiences', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.experiencesService.remove(id);
  }
}
