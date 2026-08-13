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
import { ServicesService } from './services.service';
import { CreateServiceDto, ServiceResponseDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { GetServiceDto } from './dto/get-service.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @ApiDoc({
    summary: 'Create Service',
    description: 'Creates a new service entry. Requires proper permission.',
    response: ServiceResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('services', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(
    @Req() req: Request,
    @Body() createServiceDto: CreateServiceDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.servicesService.create(req, createServiceDto, file);
  }

  @ApiDoc({
    summary: 'Get all Services',
    description: 'Retrieves all service entries. Supports pagination and filters.',
    response: ServiceResponseDto,
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetServiceDto) {
    return this.servicesService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get active Services',
    description:
      'Retrieves all active services, ordered by position, for the public homepage.',
    response: ServiceResponseDto,
    status: HttpStatus.OK,
  })
  @Get('active')
  findActive() {
    return this.servicesService.findActive();
  }

  @ApiDoc({
    summary: 'Get single Service',
    description: 'Retrieve a single service entry by UUID.',
    response: ServiceResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update Service',
    description: 'Updates an existing service entry. Requires proper permission.',
    response: ServiceResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('services', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.servicesService.update(id, updateServiceDto, file);
  }

  @ApiDoc({
    summary: 'Delete Service',
    description: 'Soft deletes a service entry. Requires proper permission.',
    response: ServiceResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('services', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.remove(id);
  }
}
