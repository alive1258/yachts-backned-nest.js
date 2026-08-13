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
import { AboutService } from './about.service';
import { CreateAboutDto, AboutResponseDto } from './dto/create-about.dto';
import { UpdateAboutDto } from './dto/update-about.dto';
import { GetAboutDto } from './dto/get-about.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';

@Controller('about')
export class AboutController {
  constructor(private readonly aboutService: AboutService) {}

  @ApiDoc({
    summary: 'Create About Section',
    description: 'Creates a new about section entry. Requires proper permission.',
    response: AboutResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('about', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(
    @Req() req: Request,
    @Body() createAboutDto: CreateAboutDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.aboutService.create(req, createAboutDto, file);
  }

  @ApiDoc({
    summary: 'Get all About Section entries',
    description: 'Retrieves all about section entries. Supports pagination and filters.',
    response: AboutResponseDto,
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetAboutDto) {
    return this.aboutService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get the active About Section',
    description: 'Retrieves the currently active about section for the public homepage.',
    response: AboutResponseDto,
    status: HttpStatus.OK,
  })
  @Get('active')
  findActive() {
    return this.aboutService.findActive();
  }

  @ApiDoc({
    summary: 'Get single About Section entry',
    description: 'Retrieve a single about section entry by UUID.',
    response: AboutResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.aboutService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update About Section entry',
    description: 'Updates an existing about section entry. Requires proper permission.',
    response: AboutResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('about', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAboutDto: UpdateAboutDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.aboutService.update(id, updateAboutDto, file);
  }

  @ApiDoc({
    summary: 'Delete About Section entry',
    description: 'Soft deletes an about section entry. Requires proper permission.',
    response: AboutResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('about', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.aboutService.remove(id);
  }
}
