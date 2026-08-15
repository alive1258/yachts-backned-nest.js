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

export class CreateEventDto {
  @ApiProperty({
    description: 'Event name',
    example: 'Cannes Yachting Festival',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Display date range',
    example: 'September 8 – 13, 2026',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  date_range: string;

  @ApiProperty({
    description: 'Event location',
    example: 'Vieux Port & Port Canto, Cannes, France',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  location: string;

  @ApiProperty({
    description: 'Event description',
    example:
      'Eco Serenity will be open for private charter previews throughout the festival — book a viewing slot in advance.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Yacht(s) present at the event',
    example: 'Eco Serenity',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  yacht: string;

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

export class EventResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  date_range: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  yacht: string;

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
