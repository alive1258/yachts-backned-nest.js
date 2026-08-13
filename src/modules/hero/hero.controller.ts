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
import { HeroService } from './hero.service';
import { CreateHeroDto, HeroResponseDto } from './dto/create-hero.dto';
import { UpdateHeroDto } from './dto/update-hero.dto';
import { GetHeroDto } from './dto/get-hero.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';

@Controller('hero')
export class HeroController {
  constructor(private readonly heroService: HeroService) {}

  @ApiDoc({
    summary: 'Create Hero Section',
    description: 'Creates a new hero section entry. Requires proper permission.',
    response: HeroResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('hero', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(
    @Req() req: Request,
    @Body() createHeroDto: CreateHeroDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.heroService.create(req, createHeroDto, file);
  }

  @ApiDoc({
    summary: 'Get all Hero Section entries',
    description: 'Retrieves all hero section entries. Supports pagination and filters.',
    response: HeroResponseDto,
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetHeroDto) {
    return this.heroService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get the active Hero Section',
    description: 'Retrieves the currently active hero section for the public homepage.',
    response: HeroResponseDto,
    status: HttpStatus.OK,
  })
  @Get('active')
  findActive() {
    return this.heroService.findActive();
  }

  @ApiDoc({
    summary: 'Get single Hero Section entry',
    description: 'Retrieve a single hero section entry by UUID.',
    response: HeroResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.heroService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update Hero Section entry',
    description: 'Updates an existing hero section entry. Requires proper permission.',
    response: HeroResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('hero', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateHeroDto: UpdateHeroDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.heroService.update(id, updateHeroDto, file);
  }

  @ApiDoc({
    summary: 'Delete Hero Section entry',
    description: 'Soft deletes a hero section entry. Requires proper permission.',
    response: HeroResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('hero', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.heroService.remove(id);
  }
}
