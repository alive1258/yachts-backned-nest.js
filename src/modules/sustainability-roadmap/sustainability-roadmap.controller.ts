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
import { SustainabilityRoadmapService } from './sustainability-roadmap.service';
import {
  CreateSustainabilityRoadmapDto,
  SustainabilityRoadmapResponseDto,
} from './dto/create-sustainability-roadmap.dto';
import { UpdateSustainabilityRoadmapDto } from './dto/update-sustainability-roadmap.dto';
import { GetSustainabilityRoadmapDto } from './dto/get-sustainability-roadmap.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';

@Controller('sustainability-roadmap')
export class SustainabilityRoadmapController {
  constructor(
    private readonly sustainabilityRoadmapService: SustainabilityRoadmapService,
  ) {}

  @ApiDoc({
    summary: 'Create Sustainability Roadmap item',
    description:
      'Creates a new Sustainability Roadmap item. Requires proper permission.',
    response: SustainabilityRoadmapResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('sustainability-roadmap', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(
    @Req() req: Request,
    @Body() createSustainabilityRoadmapDto: CreateSustainabilityRoadmapDto,
  ) {
    return this.sustainabilityRoadmapService.create(
      req,
      createSustainabilityRoadmapDto,
    );
  }

  @ApiDoc({
    summary: 'Get all Sustainability Roadmap items',
    description:
      'Retrieves all Sustainability Roadmap items. Supports pagination and filters.',
    response: SustainabilityRoadmapResponseDto,
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetSustainabilityRoadmapDto) {
    return this.sustainabilityRoadmapService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get active Sustainability Roadmap items',
    description:
      'Retrieves every active Sustainability Roadmap item, ordered by position, for the public sustainability page.',
    response: SustainabilityRoadmapResponseDto,
    isArray: true,
    status: HttpStatus.OK,
  })
  @Get('active')
  findActive() {
    return this.sustainabilityRoadmapService.findActive();
  }

  @ApiDoc({
    summary: 'Get single Sustainability Roadmap item',
    description: 'Retrieve a single Sustainability Roadmap item by UUID.',
    response: SustainabilityRoadmapResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sustainabilityRoadmapService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update Sustainability Roadmap item',
    description:
      'Updates an existing Sustainability Roadmap item. Requires proper permission.',
    response: SustainabilityRoadmapResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('sustainability-roadmap', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSustainabilityRoadmapDto: UpdateSustainabilityRoadmapDto,
  ) {
    return this.sustainabilityRoadmapService.update(
      id,
      updateSustainabilityRoadmapDto,
    );
  }

  @ApiDoc({
    summary: 'Delete Sustainability Roadmap item',
    description:
      'Soft deletes a Sustainability Roadmap item. Requires proper permission.',
    response: SustainabilityRoadmapResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('sustainability-roadmap', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.sustainabilityRoadmapService.remove(id);
  }
}
