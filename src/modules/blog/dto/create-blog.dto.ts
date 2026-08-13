import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TransformToBoolean } from 'src/modules/blog-category/dto/create-blog-category.dto';

// --- Helper Transformer for Boolean fields (handles Query/FormData strings) ---

// ==========================================
// 1. Create Blog DTO
// ==========================================
export class CreateBlogDto {
  @ApiProperty({
    description: 'Blog Title',
    example: 'শিশুর সুষম খাদ্য ও পুষ্টি নির্দেশিকা',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  title: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug',
    example: 'guidelines-for-child-balanced-diet-nutrition',
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({
    description: 'Author Name',
    example: 'ডা. হক',
  })
  @IsString()
  @IsOptional()
  @MaxLength(256)
  author_name?: string;

  @ApiPropertyOptional({
    description: 'Image URL or File Path',
    example: 'https://res.cloudinary.com/demo/image/upload/v12345/blog.jpg',
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({
    description: 'Short excerpt / summary',
    example: 'An overview of dietary guidelines for growing children.',
  })
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiPropertyOptional({
    description: 'Full blog content (HTML or Markdown)',
    example: '<p>Childhood nutrition is essential for overall health...</p>',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    description: 'Estimated read time',
    example: '5 min read',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  read_time?: string;

  @ApiPropertyOptional({
    description: 'Tags array',
    example: ['Health', 'Nutrition'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').map((v) => v.trim()) : value,
  )
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Display position / sort order',
    example: 0,
  })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  position?: number;

  @ApiPropertyOptional({ description: 'Featured blog flag', example: false })
  @TransformToBoolean()
  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @ApiPropertyOptional({ description: 'Active status flag', example: true })
  @TransformToBoolean()
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @ApiPropertyOptional({
    description: 'Blog Category UUID',
    example: '4a3faceb-8c84-4c7a-a844-eb62e84c60bf',
  })
  @IsString()
  @IsUUID()
  @IsOptional()
  category_id?: string;

  // --- SEO Metadata ---
  @ApiPropertyOptional({
    description: 'SEO Meta Title',
    example: 'Child Nutrition Guide | Health Tips',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  meta_title?: string;

  @ApiPropertyOptional({
    description: 'SEO Meta Keywords',
    example: 'child health, nutrition, diet, doctor tips',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  meta_keywords?: string;

  @ApiPropertyOptional({
    description: 'SEO Meta Description',
    example: 'Comprehensive guide to child nutrition and overall health.',
  })
  @IsString()
  @IsOptional()
  meta_description?: string;
}

// ==========================================
// 2. Update Blog DTO
// ==========================================
export class UpdateBlogDto extends PartialType(CreateBlogDto) {}

// ==========================================
// 3. Category & User Summary DTOs for Nested Responses
// ==========================================
export class BlogCategorySummaryDto {
  @ApiProperty({ example: '4a3faceb-8c84-4c7a-a844-eb62e84c60bf' })
  id: string;

  @ApiProperty({ example: 'Health & Nutrition' })
  category_name: string;

  @ApiPropertyOptional({ example: 'health-nutrition' })
  slug?: string;
}

export class UserSummaryDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiPropertyOptional({ example: 'MD Zamirul Kabir Sajib' })
  name?: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  email?: string;
}

// ==========================================
// 4. Complete Blog Response DTO
// ==========================================
export class BlogResponseDto {
  @ApiProperty({
    description: 'Blog UUID',
    example: '4a3faceb-8c84-4c7a-a844-eb62e84c60bf',
  })
  id: string;

  @ApiProperty({
    description: 'Blog Title',
    example: 'শিশুর সুষম খাদ্য ও পুষ্টি নির্দেশিকা',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug',
    example: 'guidelines-for-child-balanced-diet-nutrition',
  })
  slug?: string;

  @ApiPropertyOptional({ description: 'Author Name', example: 'ডা. হক' })
  author_name?: string;

  @ApiPropertyOptional({
    description: 'Image path or URL',
    example: 'https://res.cloudinary.com/demo/image/upload/v12345/blog.jpg',
  })
  image?: string;

  @ApiPropertyOptional({
    description: 'Short excerpt',
    example: 'An overview of dietary guidelines...',
  })
  excerpt?: string;

  @ApiPropertyOptional({
    description: 'Full content',
    example: '<p>Childhood nutrition is essential...</p>',
  })
  content?: string;

  @ApiPropertyOptional({
    description: 'Read time string',
    example: '5 min read',
  })
  read_time?: string;

  @ApiPropertyOptional({
    description: 'Tags array',
    type: [String],
    example: ['Health', 'Nutrition'],
  })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Display position order', example: 0 })
  position?: number;

  @ApiPropertyOptional({ description: 'Is featured flag', example: false })
  is_featured?: boolean;

  @ApiPropertyOptional({ description: 'Status flag', example: true })
  status?: boolean;

  @ApiPropertyOptional({
    description: 'Category UUID',
    example: '4a3faceb-8c84-4c7a-a844-eb62e84c60bf',
  })
  category_id?: string;

  @ApiPropertyOptional({
    description: 'Associated Category Object',
    type: BlogCategorySummaryDto,
  })
  @Type(() => BlogCategorySummaryDto)
  category?: BlogCategorySummaryDto;

  // --- SEO Metadata ---
  @ApiPropertyOptional({
    description: 'SEO Meta Title',
    example: 'Child Nutrition Guide | Health Tips',
  })
  meta_title?: string;

  @ApiPropertyOptional({
    description: 'SEO Meta Keywords',
    example: 'child health, nutrition, diet',
  })
  meta_keywords?: string;

  @ApiPropertyOptional({
    description: 'SEO Meta Description',
    example: 'Comprehensive guide to child nutrition...',
  })
  meta_description?: string;

  // --- Audit Fields ---
  @ApiProperty({
    description: 'User UUID who created this record',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  added_by: string;

  @ApiPropertyOptional({
    description: 'User details who added this blog',
    type: UserSummaryDto,
  })
  @Type(() => UserSummaryDto)
  added_by_user?: UserSummaryDto;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2026-04-01T10:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2026-04-01T10:00:00.000Z',
  })
  updated_at: Date;
}
