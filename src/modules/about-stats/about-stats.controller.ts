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
} from '@nestjs/common';
import { AboutStatsService } from './about-stats.service';
import {
  CreateAboutStatDto,
  AboutStatResponseDto,
} from './dto/create-about-stat.dto';
import { UpdateAboutStatDto } from './dto/update-about-stat.dto';
import { GetAboutStatDto } from './dto/get-about-stat.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';

@Controller('about-stats')
export class AboutStatsController {
  constructor(private readonly aboutStatsService: AboutStatsService) {}

  @ApiDoc({
    summary: 'Create About Stat',
    description: 'Creates a new About Stat entry. Requires proper permission.',
    response: AboutStatResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('about-stats', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(@Req() req: Request, @Body() createAboutStatDto: CreateAboutStatDto) {
    return this.aboutStatsService.create(req, createAboutStatDto);
  }

  @ApiDoc({
    summary: 'Get all About Stats',
    description:
      'Retrieves all About Stat entries. Supports pagination and filters.',
    response: AboutStatResponseDto,
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetAboutStatDto) {
    return this.aboutStatsService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get active About Stats',
    description:
      'Retrieves every active About Stat, ordered by position, for the public About page.',
    response: AboutStatResponseDto,
    isArray: true,
    status: HttpStatus.OK,
  })
  @Get('active')
  findActive() {
    return this.aboutStatsService.findActive();
  }

  @ApiDoc({
    summary: 'Get single About Stat',
    description: 'Retrieve a single About Stat entry by UUID.',
    response: AboutStatResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.aboutStatsService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update About Stat',
    description:
      'Updates an existing About Stat entry. Requires proper permission.',
    response: AboutStatResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('about-stats', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAboutStatDto: UpdateAboutStatDto,
  ) {
    return this.aboutStatsService.update(id, updateAboutStatDto);
  }

  @ApiDoc({
    summary: 'Delete About Stat',
    description: 'Soft deletes an About Stat entry. Requires proper permission.',
    response: AboutStatResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('about-stats', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.aboutStatsService.remove(id);
  }
}
