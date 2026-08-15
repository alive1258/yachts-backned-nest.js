import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { TransformToBoolean } from 'src/modules/blog-category/dto/create-blog-category.dto';

export class CreateAboutStoryDto {
  @ApiPropertyOptional({
    description: 'Small eyebrow label above the heading',
    example: 'Our Story',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  eyebrow?: string;

  @ApiProperty({
    description: 'Story heading',
    example: 'A Fleet Built Around a Simple Idea',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  heading: string;

  @ApiProperty({
    description: 'Body paragraphs, in display order',
    type: [String],
    example: [
      'Eco Yachts started with a straightforward frustration: the luxury charter industry rarely asked what a week on the water cost the water itself.',
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
  @IsNotEmpty()
  @IsString({ each: true })
  paragraphs: string[];

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
    description: 'Story image (set internally from the uploaded file)',
  })
  @IsOptional()
  image?: string;
}

export class AboutStoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  eyebrow: string;

  @ApiProperty()
  heading: string;

  @ApiProperty({ type: [String] })
  paragraphs: string[];

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
