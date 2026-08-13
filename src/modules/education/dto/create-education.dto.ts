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
import { RowItemDto } from './row-item.dto';
import { TransformToBoolean } from 'src/modules/blog-category/dto/create-blog-category.dto';

const toRowItemArray = ({ value }: { value: unknown }) => {
  if (typeof value === 'string') {
    try {
      return plainToInstance(RowItemDto, JSON.parse(value));
    } catch {
      return value;
    }
  }
  return value;
};

export class CreateEducationDto {
  @ApiPropertyOptional({
    description: 'Small eyebrow label above the heading',
    example: 'Background',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  eyebrow?: string;

  @ApiProperty({
    description: 'Section heading',
    example: 'Qualifications & Experience',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  heading: string;

  @ApiPropertyOptional({
    description: 'Supporting paragraph under the heading',
    example:
      "Dr. Anarul Islam's academic background, certifications, clinical practice, and community involvement — at a glance.",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Education rows (SSC, HSC, MBBS, ...)',
    type: [RowItemDto],
  })
  @Transform(toRowItemArray)
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RowItemDto)
  education?: RowItemDto[];

  @ApiPropertyOptional({
    description: 'Certifications & training rows',
    type: [RowItemDto],
  })
  @Transform(toRowItemArray)
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RowItemDto)
  certificates?: RowItemDto[];

  @ApiPropertyOptional({
    description: 'Honors & recognition rows',
    type: [RowItemDto],
  })
  @Transform(toRowItemArray)
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RowItemDto)
  awards?: RowItemDto[];

  @ApiPropertyOptional({
    description: 'Clinical experience rows',
    type: [RowItemDto],
  })
  @Transform(toRowItemArray)
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RowItemDto)
  experience?: RowItemDto[];

  @ApiPropertyOptional({
    description: 'Leadership / beyond-the-clinic rows',
    type: [RowItemDto],
  })
  @Transform(toRowItemArray)
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RowItemDto)
  leadership?: RowItemDto[];

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
}

export class EducationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  eyebrow: string;

  @ApiProperty()
  heading: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ type: [RowItemDto] })
  education?: RowItemDto[];

  @ApiPropertyOptional({ type: [RowItemDto] })
  certificates?: RowItemDto[];

  @ApiPropertyOptional({ type: [RowItemDto] })
  awards?: RowItemDto[];

  @ApiPropertyOptional({ type: [RowItemDto] })
  experience?: RowItemDto[];

  @ApiPropertyOptional({ type: [RowItemDto] })
  leadership?: RowItemDto[];

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
