import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class CreateVideoGallaryDto {
  /** Title */
  @ApiProperty({
    description: 'Title of the ad platform',
    example: 'Facebook Ads Manager',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Video Gallery Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  video_gallary_category_id: string;

  /** Description */
  @ApiProperty({
    description: 'Detailed description of the ad platform',
    example: 'Comprehensive advertising platform for Facebook campaigns',
  })
  @IsString()
  @IsNotEmpty()
  description?: string;

  /** Thumbnail URL */
  @ApiProperty({
    description: 'Thumbnail image URL',
    example: 'https://example.com/thumbnail.jpg',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  thumbnail?: string;

  /** Video URL */
  @ApiProperty({
    description: 'Promotional video URL',
    example: 'https://youtube.com/watch?v=yyyyy',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  video_url?: string;
}

export class VideoGallaryResponseDto {
  @ApiProperty({ description: 'Ad Platform UUID' })
  id: string;

  @ApiProperty({ description: 'Title' })
  title: string;

  @ApiProperty({ description: 'Description' })
  description: string;

  @ApiProperty({ description: 'Thumbnail URL', required: false })
  thumbnail?: string;

  @ApiProperty({ description: 'Video URL', required: false })
  video_url?: string;

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
