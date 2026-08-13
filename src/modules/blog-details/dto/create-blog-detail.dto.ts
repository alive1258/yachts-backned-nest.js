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
import { BulletItemDto } from './bullet-item.dto';
import { TransformToBoolean } from 'src/modules/blog-category/dto/create-blog-category.dto';

export class CreateBlogDetailDto {
  @ApiProperty({ description: 'Parent Blog ID', example: '1' })
  @IsString()
  @IsNotEmpty()
  blog_id: string;

  @ApiPropertyOptional({
    description: 'Image file path',
    example: 'uploads/portfolio.jpg',
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({
    description:
      'Section anchor key (used for TOC links e.g. "overview", "key-features")',
    example: 'key-features',
  })
  @IsString()
  @IsOptional()
  @MaxLength(256)
  section_key?: string;

  @ApiProperty({
    description: 'Section heading',
    example: 'Key ERP Features for Inventory',
  })
  @IsString()
  @IsOptional()
  @MaxLength(512)
  heading?: string;

  @ApiPropertyOptional({
    description: 'Section body text (separate paragraphs with \\n\\n)',
    example: 'First paragraph.\n\nSecond paragraph.',
  })
  @IsString()
  @IsOptional()
  body?: string;

  @ApiPropertyOptional({
    description: 'TOC title entries (array of strings)',
    type: [String],
    example: ['Improved Productivity', 'ERP System 82-2'],
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
  titles?: string[];

  @ApiPropertyOptional({
    description: 'Bullet points array [{title, text}]',
    type: [BulletItemDto],
    example: [
      { title: 'Real-time tracking', text: 'Monitor stock across warehouses.' },
    ],
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return plainToInstance(BulletItemDto, JSON.parse(value));
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BulletItemDto)
  bullets?: BulletItemDto[];

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

  @ApiPropertyOptional({ description: 'Status', example: true })
  @TransformToBoolean()
  @IsOptional()
  @IsBoolean()
  status?: any;
}
