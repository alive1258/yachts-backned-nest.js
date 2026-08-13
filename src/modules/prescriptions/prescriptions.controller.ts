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
import { PrescriptionsService } from './prescriptions.service';
import {
  CreatePrescriptionDto,
  PrescriptionResponseDto,
} from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { GetPrescriptionDto } from './dto/get-prescription.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';

@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @ApiDoc({
    summary: 'Create Prescription',
    description: 'Creates a new prescription. Requires proper permission.',
    response: PrescriptionResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('prescriptions', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 30, ttl: 180 } })
  @Post()
  create(@Req() req: Request, @Body() createDto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(req, createDto);
  }

  @ApiDoc({
    summary: 'Get all Prescriptions',
    description:
      'Staff-only — retrieves all prescriptions. Supports pagination and filters.',
    response: PrescriptionResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('prescriptions', 'view')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Get()
  findAll(@Query() query: GetPrescriptionDto) {
    return this.prescriptionsService.findAll(query);
  }

  @ApiDoc({
    summary: 'Search medicines',
    description:
      'Staff-only — autocomplete suggestions for medicine names via the free RxNorm API. Best-effort convenience; free text is always allowed regardless.',
    status: HttpStatus.OK,
  })
  @RequirePermission('prescriptions', 'view')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Get('medicines/search')
  searchMedicines(@Query('q') q: string) {
    return this.prescriptionsService.searchMedicines(q);
  }

  @ApiDoc({
    summary: 'Get Prescription by share token (public)',
    description:
      'No authentication — the unguessable share token itself is the access control, used by the print/download/WhatsApp-share view.',
    response: PrescriptionResponseDto,
    status: HttpStatus.OK,
  })
  @Get('share/:token')
  findByShareToken(@Param('token') token: string) {
    return this.prescriptionsService.findByShareToken(token);
  }

  @ApiDoc({
    summary: 'Get single Prescription',
    description: 'Staff-only — retrieve a single prescription by UUID.',
    response: PrescriptionResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('prescriptions', 'view')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.prescriptionsService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update Prescription',
    description: 'Staff-only — edit an existing prescription.',
    response: PrescriptionResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('prescriptions', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 30, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePrescriptionDto,
  ) {
    return this.prescriptionsService.update(id, updateDto);
  }

  @ApiDoc({
    summary: 'Delete Prescription',
    description: 'Staff-only — soft deletes a prescription.',
    response: PrescriptionResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('prescriptions', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.prescriptionsService.remove(id);
  }
}
