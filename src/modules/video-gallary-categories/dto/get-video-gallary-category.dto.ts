import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { PaginationQueryDto } from 'src/common/data-query/dto/data-query.dto';

class GetVideoGallaryCategoryBaseDto {
  /** Title */
  @ApiPropertyOptional({
    description: 'Title of the VideoGallaryCategory',
    example: 'Facebook Ads Manager Overview',
  })
  @IsString()
  @IsOptional()
  title: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class GetVideoGallaryCategoryDto extends IntersectionType(
  GetVideoGallaryCategoryBaseDto,
  PaginationQueryDto,
) {}
