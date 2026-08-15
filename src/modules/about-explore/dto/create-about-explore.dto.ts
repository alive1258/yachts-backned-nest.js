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
import { ABOUT_EXPLORE_ICONS } from './icon-options';
import type { AboutExploreIcon } from './icon-options';

export class CreateAboutExploreDto {
  @ApiProperty({
    description: 'Card title',
    example: 'Offices & People',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Card description',
    example:
      'Meet the teams behind every charter, from fleet operations to guest experience, across our regional offices.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Internal link the card navigates to',
    example: '/about/offices-people',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  href: string;

  @ApiProperty({
    description: 'Lucide icon key',
    example: 'Building2',
    enum: ABOUT_EXPLORE_ICONS,
  })
  @IsString()
  @IsIn(ABOUT_EXPLORE_ICONS)
  icon: AboutExploreIcon;

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

export class AboutExploreResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  href: string;

  @ApiProperty({ enum: ABOUT_EXPLORE_ICONS })
  icon: AboutExploreIcon;

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
