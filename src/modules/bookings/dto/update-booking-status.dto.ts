import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import type { BookingStatus } from '../entities/booking.entity';

const BOOKING_STATUSES: BookingStatus[] = [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
];

export class UpdateBookingStatusDto {
  @ApiProperty({ enum: BOOKING_STATUSES, example: 'confirmed' })
  @IsIn(BOOKING_STATUSES)
  status: BookingStatus;
}
