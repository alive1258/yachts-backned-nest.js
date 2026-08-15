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
import { AboutExploreService } from './about-explore.service';
import {
  CreateAboutExploreDto,
  AboutExploreResponseDto,
} from './dto/create-about-explore.dto';
import { UpdateAboutExploreDto } from './dto/update-about-explore.dto';
import { GetAboutExploreDto } from './dto/get-about-explore.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';

@Controller('about-explore')
export class AboutExploreController {
  constructor(private readonly aboutExploreService: AboutExploreService) {}

  @ApiDoc({
    summary: 'Create About Explore card',
    description:
      'Creates a new About Explore card entry. Requires proper permission.',
    response: AboutExploreResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('about-explore', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(@Req() req: Request, @Body() createAboutExploreDto: CreateAboutExploreDto) {
    return this.aboutExploreService.create(req, createAboutExploreDto);
  }

  @ApiDoc({
    summary: 'Get all About Explore cards',
    description:
      'Retrieves all About Explore card entries. Supports pagination and filters.',
    response: AboutExploreResponseDto,
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetAboutExploreDto) {
    return this.aboutExploreService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get active About Explore cards',
    description:
      'Retrieves every active About Explore card, ordered by position, for the public About page.',
    response: AboutExploreResponseDto,
    isArray: true,
    status: HttpStatus.OK,
  })
  @Get('active')
  findActive() {
    return this.aboutExploreService.findActive();
  }

  @ApiDoc({
    summary: 'Get single About Explore card',
    description: 'Retrieve a single About Explore card entry by UUID.',
    response: AboutExploreResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.aboutExploreService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update About Explore card',
    description:
      'Updates an existing About Explore card entry. Requires proper permission.',
    response: AboutExploreResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('about-explore', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAboutExploreDto: UpdateAboutExploreDto,
  ) {
    return this.aboutExploreService.update(id, updateAboutExploreDto);
  }

  @ApiDoc({
    summary: 'Delete About Explore card',
    description:
      'Soft deletes an About Explore card entry. Requires proper permission.',
    response: AboutExploreResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('about-explore', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.aboutExploreService.remove(id);
  }
}
