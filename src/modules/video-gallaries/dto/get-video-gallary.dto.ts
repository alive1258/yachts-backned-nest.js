import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/data-query/dto/data-query.dto';

class GetVideoGallaryBaseDto {
  /** Filter by Category ID */
  @ApiPropertyOptional({
    description: 'Filter by Video Gallery Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  video_gallary_category_id?: string;

  /** Title */
  @ApiPropertyOptional({
    description: 'Title of the Video',
    example: 'Dairy Farm Management Guide',
  })
  @IsString()
  @IsOptional()
  title?: string;

  /** Description */
  @ApiPropertyOptional({
    description: 'Detailed description of the Video',
    example: 'Comprehensive walkthrough of best practices in cattle health.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  /** Filter by active status */
  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  is_active?: boolean;
}

export class GetVideoGallaryDto extends IntersectionType(
  GetVideoGallaryBaseDto,
  PaginationQueryDto,
) {}
