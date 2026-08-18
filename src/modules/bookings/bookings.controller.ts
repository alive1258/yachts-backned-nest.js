import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { GetBookingDto } from './dto/get-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @ApiDoc({
    summary: 'Create Booking',
    description:
      'Creates a booking request for the authenticated user. Snapshots current yacht pricing and rejects overlapping dates.',
    status: HttpStatus.OK,
  })
  @UseGuards(JwtOrApiKeyGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(@Req() req: Request, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(req, dto);
  }

  @ApiDoc({
    summary: 'Get my Bookings',
    description: "Retrieves the authenticated user's own booking history.",
    status: HttpStatus.OK,
  })
  @UseGuards(JwtOrApiKeyGuard)
  @Get('mine')
  findMine(@Req() req: Request, @Query() query: GetBookingDto) {
    return this.bookingsService.findMine(req, query);
  }

  @ApiDoc({
    summary: 'Get all Bookings',
    description:
      'Retrieves every booking across all customers. Requires proper permission.',
    status: HttpStatus.OK,
  })
  @RequirePermission('bookings', 'view')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Get()
  findAll(@Query() query: GetBookingDto) {
    return this.bookingsService.findAllAdmin(query);
  }

  @ApiDoc({
    summary: 'Get single Booking',
    description:
      "Retrieve a single booking by id. Allowed for the booking's owner, or staff holding the bookings.view permission.",
    status: HttpStatus.OK,
  })
  @UseGuards(JwtOrApiKeyGuard)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.bookingsService.findOne(id, req);
  }

  @ApiDoc({
    summary: 'Update Booking status',
    description:
      'Confirms, cancels, or completes a booking. Requires proper permission.',
    status: HttpStatus.OK,
  })
  @RequirePermission('bookings', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, dto);
  }
}
