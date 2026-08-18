import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    description: 'Yacht to book',
    example: '5f8d0d55-1c1b-4b6a-9c2e-2b5a6f1a1234',
  })
  @IsUUID()
  yacht_id: string;

  @ApiProperty({ description: 'Check-in date (ISO)', example: '2026-07-10' })
  @IsDateString()
  check_in: string;

  @ApiProperty({ description: 'Check-out date (ISO)', example: '2026-07-17' })
  @IsDateString()
  check_out: string;

  @ApiProperty({ description: 'Number of guests', example: 6 })
  @IsInt()
  @Min(1)
  @Max(200)
  guests: number;

  @ApiPropertyOptional({
    description: 'Optional note from the guest to the charter team',
    example: 'Celebrating an anniversary, would love a bottle of champagne aboard.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}
