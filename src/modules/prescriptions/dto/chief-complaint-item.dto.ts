import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ComplaintDurationUnit } from '../entities/prescription.entity';

export class ChiefComplaintItemDto {
  @ApiProperty({ description: 'Complaint name', example: 'Pain in abdomen' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'How long the complaint has lasted', example: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(999)
  @IsOptional()
  duration_value?: number;

  @ApiPropertyOptional({ enum: ComplaintDurationUnit })
  @IsEnum(ComplaintDurationUnit)
  @IsOptional()
  duration_unit?: ComplaintDurationUnit;

  @ApiPropertyOptional({ description: 'Free-text note', example: 'Worse at night' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string;
}
