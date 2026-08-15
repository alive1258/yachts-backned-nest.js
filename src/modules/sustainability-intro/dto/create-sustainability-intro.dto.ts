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

export class CreateSustainabilityIntroDto {
  @ApiPropertyOptional({
    description: 'Small eyebrow label above the heading',
    example: 'Why It Matters',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  eyebrow?: string;

  @ApiProperty({
    description: 'Section heading',
    example: "Sustainability Isn't an Add-On Here",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  heading: string;

  @ApiProperty({
    description: 'Body paragraphs, in display order',
    type: [String],
    example: [
      'Luxury charter has historically treated environmental impact as someone else\'s problem.',
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
    description: 'Section image (set internally from the uploaded file)',
  })
  @IsOptional()
  image?: string;
}

export class SustainabilityIntroResponseDto {
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
