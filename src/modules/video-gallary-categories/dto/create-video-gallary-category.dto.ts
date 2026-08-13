import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUrl,
  IsBoolean,
} from 'class-validator';

export class CreateVideoGallaryCategoryDto {
  /** Title */
  @ApiProperty({
    description: 'Title of the ad platform',
    example: 'Facebook Ads Manager',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  /** Is Active Status */
  @ApiProperty({
    description: 'Active status of category',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class VideoGallaryCategoryResponseDto {
  @ApiProperty({ description: 'Ad Platform UUID' })
  id: string;

  @ApiProperty({ description: 'Title' })
  title: string;

  @ApiProperty({ description: 'Is active', required: false })
  is_active?: boolean;

  @ApiProperty({ description: 'Added by summary', type: Object })
  addedBy?: {
    id: string;
    name?: string;
    email?: string;
    role?: string;
  };

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: Date;

  @ApiProperty({
    description: 'Deletion timestamp',
    example: '2025-01-01T00:00:00.000Z',
    required: false,
  })
  deleted_at?: Date;
}
