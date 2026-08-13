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
import { DestinationsService } from './destinations.service';
import {
  CreateDestinationDto,
  DestinationResponseDto,
} from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';
import { GetDestinationDto } from './dto/get-destination.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';

@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @ApiDoc({
    summary: 'Create Destination',
    description: 'Creates a new destination entry. Requires proper permission.',
    response: DestinationResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('destinations', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(
    @Req() req: Request,
    @Body() createDestinationDto: CreateDestinationDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.destinationsService.create(req, createDestinationDto, file);
  }

  @ApiDoc({
    summary: 'Get all Destination entries',
    description:
      'Retrieves all destination entries. Supports pagination and filters.',
    response: DestinationResponseDto,
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetDestinationDto) {
    return this.destinationsService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get all active Destinations',
    description:
      'Retrieves every active destination, ordered by position, for the public site.',
    response: DestinationResponseDto,
    isArray: true,
    status: HttpStatus.OK,
  })
  @Get('active')
  findActive() {
    return this.destinationsService.findActive();
  }

  @ApiDoc({
    summary: 'Get single Destination entry',
    description: 'Retrieve a single destination entry by UUID.',
    response: DestinationResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.destinationsService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update Destination entry',
    description:
      'Updates an existing destination entry. Requires proper permission.',
    response: DestinationResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('destinations', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDestinationDto: UpdateDestinationDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.destinationsService.update(id, updateDestinationDto, file);
  }

  @ApiDoc({
    summary: 'Delete Destination entry',
    description: 'Soft deletes a destination entry. Requires proper permission.',
    response: DestinationResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('destinations', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.destinationsService.remove(id);
  }
}
