import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsUUID } from 'class-validator';
import type { PaymentType } from '../entities/payment.entity';

const PAYMENT_TYPES: PaymentType[] = ['deposit', 'balance'];

export class CreateCheckoutSessionDto {
  @ApiProperty({ description: 'Booking to pay for' })
  @IsUUID()
  booking_id: string;

  @ApiProperty({ enum: PAYMENT_TYPES, example: 'deposit' })
  @IsIn(PAYMENT_TYPES)
  type: PaymentType;
}
