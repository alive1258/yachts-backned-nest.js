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
import { AppointmentsService } from './appointments.service';
import {
  CreateAppointmentDto,
  AppointmentResponseDto,
} from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { GetAppointmentDto } from './dto/get-appointment.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @ApiDoc({
    summary: 'Book an appointment (public)',
    description:
      'Patient-facing booking endpoint — no authentication required. Resolves the chamber scheduled for the requested date and assigns the next serial number in that day\'s queue.',
    response: AppointmentResponseDto,
    status: HttpStatus.OK,
  })
  // Deliberately public and tightly throttled — this is the homepage
  // booking form, not a staff action.
  @Throttle({ default: { limit: 5, ttl: 600 } })
  @Post()
  createPublic(@Body() createDto: CreateAppointmentDto) {
    return this.appointmentsService.createPublic(createDto);
  }

  @ApiDoc({
    summary: 'Book an appointment on a patient\'s behalf (staff)',
    description:
      'For patients who called in by phone. Marked confirmed immediately and attributed to the staff member who created it.',
    response: AppointmentResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('appointments', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 30, ttl: 180 } })
  @Post('manual')
  createManual(@Req() req: Request, @Body() createDto: CreateAppointmentDto) {
    return this.appointmentsService.createManual(req, createDto);
  }

  @ApiDoc({
    summary: 'Get all Appointments',
    description:
      'Staff-only — retrieves all appointments. Supports pagination and filters (status, source, chamber, date range, search).',
    response: AppointmentResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('appointments', 'view')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Get()
  findAll(@Query() query: GetAppointmentDto) {
    return this.appointmentsService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get single Appointment',
    description: 'Staff-only — retrieve a single appointment by UUID.',
    response: AppointmentResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('appointments', 'view')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentsService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update Appointment',
    description:
      'Staff-only — edit patient details, change status, or reschedule (changing appointment_date reassigns chamber/serial/ETA).',
    response: AppointmentResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('appointments', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 30, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(id, updateDto);
  }

  @ApiDoc({
    summary: 'Delete Appointment',
    description:
      'Staff-only — permanently removes an appointment record. For a normal cancellation, prefer PATCH status=cancelled instead.',
    response: AppointmentResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('appointments', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentsService.remove(id);
  }
}
