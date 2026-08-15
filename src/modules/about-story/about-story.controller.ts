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
import { AboutStoryService } from './about-story.service';
import {
  CreateAboutStoryDto,
  AboutStoryResponseDto,
} from './dto/create-about-story.dto';
import { UpdateAboutStoryDto } from './dto/update-about-story.dto';
import { GetAboutStoryDto } from './dto/get-about-story.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';

@Controller('about-story')
export class AboutStoryController {
  constructor(private readonly aboutStoryService: AboutStoryService) {}

  @ApiDoc({
    summary: 'Create About Story',
    description: 'Creates a new About Story entry. Requires proper permission.',
    response: AboutStoryResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('about-story', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(
    @Req() req: Request,
    @Body() createAboutStoryDto: CreateAboutStoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.aboutStoryService.create(req, createAboutStoryDto, file);
  }

  @ApiDoc({
    summary: 'Get all About Story entries',
    description:
      'Retrieves all About Story entries. Supports pagination and filters.',
    response: AboutStoryResponseDto,
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetAboutStoryDto) {
    return this.aboutStoryService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get the active About Story',
    description:
      'Retrieves the currently active About Story entry for the public About page.',
    response: AboutStoryResponseDto,
    status: HttpStatus.OK,
  })
  @Get('active')
  findActive() {
    return this.aboutStoryService.findActive();
  }

  @ApiDoc({
    summary: 'Get single About Story entry',
    description: 'Retrieve a single About Story entry by UUID.',
    response: AboutStoryResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.aboutStoryService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update About Story entry',
    description:
      'Updates an existing About Story entry. Requires proper permission.',
    response: AboutStoryResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('about-story', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAboutStoryDto: UpdateAboutStoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.aboutStoryService.update(id, updateAboutStoryDto, file);
  }

  @ApiDoc({
    summary: 'Delete About Story entry',
    description:
      'Soft deletes an About Story entry. Requires proper permission.',
    response: AboutStoryResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('about-story', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.aboutStoryService.remove(id);
  }
}
