import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export const TransformToBoolean = () =>
  Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim().toLowerCase() === 'true';
    }
    return Boolean(value);
  });

export class CreateBlogCategoryDto {
  @ApiProperty({
    description: 'Blog Category Name',
    example: 'Technology',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  category_name: string;

  @ApiPropertyOptional({
    description: 'Description (optional)',
    example: 'Articles about technology trends',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Status',
    example: true,
  })
  @TransformToBoolean()
  @IsOptional()
  @IsBoolean()
  status?: any;
}
