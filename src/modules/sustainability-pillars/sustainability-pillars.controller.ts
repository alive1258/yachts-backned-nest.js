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
import { SustainabilityPillarsService } from './sustainability-pillars.service';
import {
  CreateSustainabilityPillarDto,
  SustainabilityPillarResponseDto,
} from './dto/create-sustainability-pillar.dto';
import { UpdateSustainabilityPillarDto } from './dto/update-sustainability-pillar.dto';
import { GetSustainabilityPillarDto } from './dto/get-sustainability-pillar.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';

@Controller('sustainability-pillars')
export class SustainabilityPillarsController {
  constructor(
    private readonly sustainabilityPillarsService: SustainabilityPillarsService,
  ) {}

  @ApiDoc({
    summary: 'Create Sustainability Pillar',
    description:
      'Creates a new Sustainability Pillar entry. Requires proper permission.',
    response: SustainabilityPillarResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('sustainability-pillars', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(
    @Req() req: Request,
    @Body() createSustainabilityPillarDto: CreateSustainabilityPillarDto,
  ) {
    return this.sustainabilityPillarsService.create(
      req,
      createSustainabilityPillarDto,
    );
  }

  @ApiDoc({
    summary: 'Get all Sustainability Pillars',
    description:
      'Retrieves all Sustainability Pillar entries. Supports pagination and filters.',
    response: SustainabilityPillarResponseDto,
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetSustainabilityPillarDto) {
    return this.sustainabilityPillarsService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get active Sustainability Pillars',
    description:
      'Retrieves every active Sustainability Pillar, ordered by position, for the public sustainability page.',
    response: SustainabilityPillarResponseDto,
    isArray: true,
    status: HttpStatus.OK,
  })
  @Get('active')
  findActive() {
    return this.sustainabilityPillarsService.findActive();
  }

  @ApiDoc({
    summary: 'Get single Sustainability Pillar',
    description: 'Retrieve a single Sustainability Pillar entry by UUID.',
    response: SustainabilityPillarResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sustainabilityPillarsService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update Sustainability Pillar',
    description:
      'Updates an existing Sustainability Pillar entry. Requires proper permission.',
    response: SustainabilityPillarResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('sustainability-pillars', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSustainabilityPillarDto: UpdateSustainabilityPillarDto,
  ) {
    return this.sustainabilityPillarsService.update(
      id,
      updateSustainabilityPillarDto,
    );
  }

  @ApiDoc({
    summary: 'Delete Sustainability Pillar',
    description:
      'Soft deletes a Sustainability Pillar entry. Requires proper permission.',
    response: SustainabilityPillarResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('sustainability-pillars', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.sustainabilityPillarsService.remove(id);
  }
}
