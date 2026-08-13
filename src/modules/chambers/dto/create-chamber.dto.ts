import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { TransformToBoolean } from 'src/modules/blog-category/dto/create-blog-category.dto';
import { Weekday } from '../entities/chamber.entity';

const HHMM_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class CreateChamberDto {
  @ApiProperty({
    description: 'Day of week: 0 (Sunday) – 6 (Saturday)',
    example: 1,
    minimum: 0,
    maximum: 6,
  })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  @Max(6)
  day_of_week: Weekday;

  @ApiProperty({
    description: 'Chamber/hospital name',
    example: 'Pranto Specialized Hospital',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  location_name: string;

  @ApiPropertyOptional({
    description: 'Full address',
    example: 'Mirpur-10, Dhaka',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Consultation fee at this chamber (BDT)',
    example: 800,
  })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  fee: number;

  @ApiProperty({ description: 'Chamber start time, 24h HH:mm', example: '14:00' })
  @Matches(HHMM_PATTERN, { message: 'start_time must be in HH:mm 24h format' })
  start_time: string;

  @ApiProperty({ description: 'Chamber end time, 24h HH:mm', example: '20:00' })
  @Matches(HHMM_PATTERN, { message: 'end_time must be in HH:mm 24h format' })
  end_time: string;

  @ApiPropertyOptional({
    description: 'Average minutes spent per patient',
    example: 8,
    default: 10,
  })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  avg_minutes_per_patient?: number;

  @ApiPropertyOptional({
    description:
      'Max patients bookable per day (defaults to hours ÷ avg minutes if unset)',
    example: 30,
  })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  max_patients?: number;

  @ApiPropertyOptional({ description: 'Is active', example: true, default: true })
  @TransformToBoolean()
  @IsOptional()
  @IsBoolean()
  is_active?: any;
}

/**
 * Creates the same chamber schedule (location, fee, hours, ...) across
 * several weekdays in one request — backs the Add Chamber form's
 * multi-day selector.
 */
export class CreateChambersBulkDto extends OmitType(CreateChamberDto, [
  'day_of_week',
] as const) {
  @ApiProperty({
    description:
      'Days of week to create this chamber schedule for: 0 (Sunday) – 6 (Saturday)',
    example: [1, 3, 5],
    type: [Number],
  })
  @Transform(({ value }) => (Array.isArray(value) ? value.map(Number) : value))
  @IsArray()
  @ArrayNotEmpty({ message: 'Select at least one day of week' })
  @ArrayUnique({ message: 'Each day of week may only be selected once' })
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  day_of_week: Weekday[];
}

export class ChamberResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  day_of_week: Weekday;

  @ApiProperty()
  location_name: string;

  @ApiPropertyOptional()
  address?: string;

  @ApiProperty()
  fee: number;

  @ApiProperty()
  start_time: string;

  @ApiProperty()
  end_time: string;

  @ApiProperty()
  avg_minutes_per_patient: number;

  @ApiPropertyOptional()
  max_patients?: number;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiPropertyOptional()
  deleted_at?: Date;
}
