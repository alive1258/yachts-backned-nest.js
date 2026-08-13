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
import { ChambersService } from './chambers.service';
import {
  CreateChamberDto,
  CreateChambersBulkDto,
  ChamberResponseDto,
} from './dto/create-chamber.dto';
import { UpdateChamberDto } from './dto/update-chamber.dto';
import { GetChamberDto } from './dto/get-chamber.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';

@Controller('chambers')
export class ChambersController {
  constructor(private readonly chambersService: ChambersService) {}

  @ApiDoc({
    summary: 'Create Chamber',
    description:
      'Creates a new weekday chamber schedule entry. Requires proper permission.',
    response: ChamberResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('chambers', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(@Req() req: Request, @Body() createDto: CreateChamberDto) {
    return this.chambersService.create(req, createDto);
  }

  @ApiDoc({
    summary: 'Create Chamber across multiple days',
    description:
      'Creates the same chamber schedule (location, fee, hours, ...) for several selected weekdays at once. Requires proper permission.',
    response: ChamberResponseDto,
    isArray: true,
    status: HttpStatus.OK,
  })
  @RequirePermission('chambers', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post('bulk')
  createBulk(@Req() req: Request, @Body() createDto: CreateChambersBulkDto) {
    return this.chambersService.createBulk(req, createDto);
  }

  @ApiDoc({
    summary: 'Get all Chambers',
    description: 'Retrieves all chambers. Supports pagination and filters.',
    response: ChamberResponseDto,
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetChamberDto) {
    return this.chambersService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get active Chambers',
    description:
      'Retrieves all active chambers (one per weekday), ordered Sun-Sat, for the public booking form.',
    response: ChamberResponseDto,
    status: HttpStatus.OK,
  })
  @Get('active')
  findActive() {
    return this.chambersService.findActive();
  }

  @ApiDoc({
    summary: 'Get single Chamber',
    description: 'Retrieve a single chamber by UUID.',
    response: ChamberResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.chambersService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update Chamber',
    description: 'Updates an existing chamber. Requires proper permission.',
    response: ChamberResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('chambers', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateChamberDto,
  ) {
    return this.chambersService.update(id, updateDto);
  }

  @ApiDoc({
    summary: 'Delete Chamber',
    description: 'Soft deletes a chamber. Requires proper permission.',
    response: ChamberResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('chambers', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.chambersService.remove(id);
  }
}
