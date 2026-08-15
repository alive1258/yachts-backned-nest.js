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
import { SUSTAINABILITY_PILLAR_ICONS } from './icon-options';
import type { SustainabilityPillarIcon } from './icon-options';

export class CreateSustainabilityPillarDto {
  @ApiProperty({
    description: 'Pillar title',
    example: 'Fleet Electrification',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Pillar description',
    example:
      'Every new build and major refit moves toward hybrid-electric propulsion, cutting fuel burn without cutting range or comfort.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Lucide icon key',
    example: 'BatteryCharging',
    enum: SUSTAINABILITY_PILLAR_ICONS,
  })
  @IsString()
  @IsIn(SUSTAINABILITY_PILLAR_ICONS)
  icon: SustainabilityPillarIcon;

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

export class SustainabilityPillarResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: SUSTAINABILITY_PILLAR_ICONS })
  icon: SustainabilityPillarIcon;

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
