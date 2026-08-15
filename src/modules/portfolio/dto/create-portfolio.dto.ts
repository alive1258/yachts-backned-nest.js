import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { TransformToBoolean } from 'src/modules/blog-category/dto/create-blog-category.dto';
import { PORTFOLIO_ICONS } from './icon-options';
import type { PortfolioIcon } from './icon-options';

export class CreatePortfolioDto {
  @ApiProperty({
    description: 'Portfolio card title',
    example: 'Family Charters',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Portfolio card description',
    example:
      'Shallow-draft tenders, connecting cabins, and itineraries paced for guests of every age.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Lucide icon key',
    example: 'Users2',
    enum: PORTFOLIO_ICONS,
  })
  @IsString()
  @IsIn(PORTFOLIO_ICONS)
  icon: PortfolioIcon;

  @ApiProperty({
    description: 'Internal link the card navigates to',
    example: '/yachts',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  href: string;

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
    description: 'Card image (set internally from the uploaded file)',
  })
  @IsOptional()
  image?: string;
}

export class PortfolioResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: PORTFOLIO_ICONS })
  icon: PortfolioIcon;

  @ApiPropertyOptional()
  image?: string;

  @ApiProperty()
  href: string;

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
