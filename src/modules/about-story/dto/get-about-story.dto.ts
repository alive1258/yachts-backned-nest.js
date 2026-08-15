import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/data-query/dto/data-query.dto';

class GetAboutStoryBaseDto {
  @ApiPropertyOptional({
    description: 'Filter by heading (partial match)',
    example: 'A Fleet Built Around a Simple Idea',
  })
  @IsOptional()
  @IsString()
  heading?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  position?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active?: boolean;
}

export class GetAboutStoryDto extends IntersectionType(
  GetAboutStoryBaseDto,
  PaginationQueryDto,
) {}
