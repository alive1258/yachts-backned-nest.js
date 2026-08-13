import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateMenuDto {
  /** Sidebar label */
  @ApiProperty({
    description: 'Sidebar label shown to the user',
    maxLength: 100,
    example: 'Testimonials',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  label: string;

  /** Frontend route */
  @ApiPropertyOptional({
    description:
      'Route this item links to. Omit for a parent/dropdown-only item.',
    maxLength: 255,
    example: '/dashboard/testimonials/all-testimonials',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  href?: string;

  /** Icon */
  @ApiPropertyOptional({
    description: 'Lucide icon name, resolved to a component on the frontend',
    maxLength: 50,
    example: 'Quote',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  /** Stable machine key for permission wiring */
  @ApiProperty({
    description:
      'Stable machine key used to target this menu from role permission grants. Lowercase, hyphen/underscore-separated.',
    example: 'testimonials',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-z0-9_-]+$/, {
    message: 'key must be lowercase letters, numbers, hyphens or underscores',
  })
  key: string;

  /** Parent menu */
  @ApiPropertyOptional({
    description: 'Parent menu UUID, for nested/dropdown items',
    example: '8a3f0f7b-6d59-4db4-bdc1-2b45a9c9c5a1',
  })
  @IsOptional()
  @IsUUID()
  parent_id?: string;

  /** Sort order */
  @ApiPropertyOptional({
    description: 'Sort order among siblings, ascending',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  /** Active flag */
  @ApiPropertyOptional({
    description: 'Whether the item renders in the sidebar',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class MenuResponseDto {
  @ApiProperty({ description: 'Menu UUID' })
  id: string;

  @ApiProperty({ description: 'Sidebar label' })
  label: string;

  @ApiPropertyOptional({ description: 'Route this item links to' })
  href?: string;

  @ApiPropertyOptional({ description: 'Lucide icon name' })
  icon?: string;

  @ApiProperty({ description: 'Stable machine key for permission wiring' })
  key: string;

  @ApiPropertyOptional({ description: 'Parent menu UUID' })
  parent_id?: string;

  @ApiProperty({ description: 'Sort order among siblings' })
  order: number;

  @ApiProperty({ description: 'Whether the item renders in the sidebar' })
  is_active: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: Date;

  @ApiPropertyOptional({
    example: '2025-01-01T00:00:00.000Z',
    description: 'Soft delete timestamp',
  })
  deleted_at?: Date;
}
