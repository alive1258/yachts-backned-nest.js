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
import { HighlightItemDto } from './highlight-item.dto';
import { TransformToBoolean } from 'src/modules/blog-category/dto/create-blog-category.dto';

export class CreateSustainabilityDto {
  @ApiPropertyOptional({
    description: 'Small eyebrow text above the heading',
    example: 'A Greener Way to Sail',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  label?: string;

  @ApiProperty({
    description: 'Section heading',
    example: 'Luxury that Cares for Our Planet',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'Section description',
    example:
      "We believe unforgettable travel shouldn't cost the earth. Every yacht in our fleet is chosen and maintained with sustainability at its core.",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Bullet highlights [{icon, title, description}]',
    type: [HighlightItemDto],
    example: [
      {
        icon: 'Zap',
        title: 'Hybrid & Electric-Powered Yachts',
        description: 'Low-emission propulsion across most of our fleet.',
      },
    ],
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return plainToInstance(HighlightItemDto, JSON.parse(value));
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => HighlightItemDto)
  highlights?: HighlightItemDto[];

  @ApiPropertyOptional({
    description: 'CTA button text',
    example: 'Go Sustainable',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  button_text?: string;

  @ApiPropertyOptional({
    description: 'CTA button link/anchor',
    example: '#experiences',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  button_link?: string;

  @ApiPropertyOptional({
    description: 'Floating badge text over the image',
    example: 'Eco Certified',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  badge_text?: string;

  @ApiPropertyOptional({
    description: 'Lucide icon name for the floating badge',
    example: 'ShieldCheck',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  badge_icon?: string;

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
    description: 'Feature image (set internally from the uploaded file)',
  })
  @IsOptional()
  image?: string;
}

export class SustainabilityResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  label?: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ type: [HighlightItemDto] })
  highlights?: HighlightItemDto[];

  @ApiProperty()
  button_text: string;

  @ApiPropertyOptional()
  button_link?: string;

  @ApiPropertyOptional()
  badge_text?: string;

  @ApiPropertyOptional()
  badge_icon?: string;

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
