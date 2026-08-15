import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { TransformToBoolean } from 'src/modules/blog-category/dto/create-blog-category.dto';

export class CreateSustainabilityRoadmapDto {
  @ApiProperty({
    description: 'Roadmap year label',
    example: '2024',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  year: string;

  @ApiProperty({
    description: 'Roadmap milestone',
    example:
      'Completed hybrid-electric refits across the first eight yachts in the fleet.',
  })
  @IsString()
  @IsNotEmpty()
  milestone: string;

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

export class SustainabilityRoadmapResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  year: string;

  @ApiProperty()
  milestone: string;

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
