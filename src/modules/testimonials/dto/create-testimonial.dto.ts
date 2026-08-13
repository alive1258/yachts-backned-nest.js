import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { TransformToBoolean } from 'src/modules/blog-category/dto/create-blog-category.dto';

export class CreateTestimonialDto {
  @ApiProperty({
    description: 'Patient name',
    example: 'Rahim',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Relation/role label',
    example: 'Patient',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  designation?: string;

  @ApiProperty({
    description: 'Review/quote text',
    example:
      'Dr. Islam listened patiently and explained my test results in a way I could actually understand.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Star rating, 1-5',
    example: 5,
  })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    description: 'Video testimonial URL (presence marks it a video review)',
    example: 'https://res.cloudinary.com/demo/video/upload/testimonial.mp4',
  })
  @IsUrl()
  @IsOptional()
  video_url?: string;

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
    description: 'Patient photo (set internally from the uploaded file)',
  })
  @IsOptional()
  image?: string;
}

export class TestimonialResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  designation?: string;

  @ApiPropertyOptional()
  image?: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  rating: number;

  @ApiPropertyOptional()
  video_url?: string;

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
