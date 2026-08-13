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
import { InfoItemDto } from './info-item.dto';
import { TransformToBoolean } from 'src/modules/blog-category/dto/create-blog-category.dto';

export class CreateAboutDto {
  @ApiPropertyOptional({
    description: 'Small eyebrow label above the name',
    example: 'About The Doctor',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  eyebrow?: string;

  @ApiProperty({
    description: "Doctor's display name",
    example: 'Dr. Anarul Islam',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Short qualifications line',
    example: 'MBBS (DU), MS Neurosurgery (Course)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Specialty line',
    example: 'Neurosurgery & General Medicine',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  specialty: string;

  @ApiPropertyOptional({
    description: 'Bio paragraphs, in display order',
    type: [String],
    example: [
      'Dr. Anarul Islam is a physician trained at Dhaka University (MBBS)...',
    ],
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
  bio?: string[];

  @ApiPropertyOptional({
    description: 'Info grid [{icon, label, value}]',
    type: [InfoItemDto],
    example: [
      {
        icon: 'GraduationCap',
        label: 'Qualifications',
        value: 'MBBS (DU), CMU, MS Neurosurgery (Course)',
      },
    ],
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return plainToInstance(InfoItemDto, JSON.parse(value));
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => InfoItemDto)
  info?: InfoItemDto[];

  @ApiPropertyOptional({
    description: 'Medical registration line',
    example: 'BMDC Reg. No. — 12345',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  registration?: string;

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

export class AboutResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  eyebrow: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  specialty: string;

  @ApiPropertyOptional({ type: [String] })
  bio?: string[];

  @ApiPropertyOptional({ type: [InfoItemDto] })
  info?: InfoItemDto[];

  @ApiPropertyOptional()
  registration?: string;

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
