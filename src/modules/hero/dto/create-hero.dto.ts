import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { StatItemDto } from './stat-item.dto';
import { TransformToBoolean } from 'src/modules/blog-category/dto/create-blog-category.dto';

export class CreateHeroDto {
  @ApiPropertyOptional({
    description: 'Small badge line above the headline',
    example: 'MBBS (DU) • CMU (Ultrasonography) • MS Neurosurgery (Course)',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  badge?: string;

  @ApiPropertyOptional({
    description: 'Affiliation line under the headline',
    example: 'Bangladesh Medical University (Ex-PG Hospital), Mirpur',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  affiliation?: string;

  @ApiProperty({
    description: 'Headline title',
    example: 'Dr. Anarul Islam',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'Sub-headline description',
    example:
      'Compassionate, personalized medical care from Dr. Anarul Islam — combining modern neurosurgical training with attentive, patient-first treatment.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Areas of focus (array of strings)',
    type: [String],
    example: ['Brain and Spinal Tumors', 'Cerebrovascular Diseases'],
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [value];
      }
    }
    return value;
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  specialties?: string[];

  @ApiPropertyOptional({
    description: 'Primary CTA button text',
    example: 'Book Appointment',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  primary_button_text?: string;

  @ApiPropertyOptional({
    description: 'Primary CTA button link/anchor',
    example: '#appointment',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  primary_button_link?: string;

  @ApiPropertyOptional({
    description: 'Secondary CTA button text',
    example: 'Watch Intro Video',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  secondary_button_text?: string;

  @ApiPropertyOptional({
    description: 'Secondary CTA button link/anchor',
    example: '#video',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  secondary_button_link?: string;

  @ApiPropertyOptional({
    description: 'Trust stats array [{icon, value, label}]',
    type: [StatItemDto],
    example: [{ icon: 'Award', value: '5+ Yrs', label: 'In Experience' }],
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return plainToInstance(StatItemDto, JSON.parse(value));
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => StatItemDto)
  stats?: StatItemDto[];

  @ApiPropertyOptional({
    description: 'Rating value',
    example: '5',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  rating_value?: string;

  @ApiPropertyOptional({
    description: 'Rating label',
    example: '50000+ Patient Reviews',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  rating_label?: string;

  @ApiPropertyOptional({
    description: 'Floating availability badge text',
    example: 'Available for Appointments',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  floating_badge?: string;

  @ApiPropertyOptional({
    description: 'Display order (lowest first)',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  })
  position?: number;

  @ApiPropertyOptional({ description: 'Is active', example: true, default: true })
  @TransformToBoolean()
  @IsOptional()
  @IsBoolean()
  is_active?: any;

  @ApiPropertyOptional({
    description: 'Doctor image (set internally from the uploaded file)',
  })
  @IsOptional()
  image?: string;
}

export class HeroResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  badge?: string;

  @ApiPropertyOptional()
  affiliation?: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  specialties?: string[];

  @ApiProperty()
  primary_button_text: string;

  @ApiPropertyOptional()
  primary_button_link?: string;

  @ApiPropertyOptional()
  secondary_button_text?: string;

  @ApiPropertyOptional()
  secondary_button_link?: string;

  @ApiPropertyOptional({ type: [StatItemDto] })
  stats?: StatItemDto[];

  @ApiPropertyOptional()
  rating_value?: string;

  @ApiPropertyOptional()
  rating_label?: string;

  @ApiPropertyOptional()
  floating_badge?: string;

  @ApiPropertyOptional()
  image?: string;

  @ApiProperty()
  position: number;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiPropertyOptional()
  deleted_at?: Date;
}
