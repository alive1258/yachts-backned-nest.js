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

export class CreateDestinationDto {
  @ApiProperty({
    description: 'Destination name',
    example: 'Greek Islands',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Destination description',
    example: 'Whitewashed villages and crystal Aegean coves.',
  })
  @IsString()
  @IsOptional()
  description?: string;

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
    description: 'Destination photo (set internally from the uploaded file)',
  })
  @IsOptional()
  image?: string;
}

export class DestinationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

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
