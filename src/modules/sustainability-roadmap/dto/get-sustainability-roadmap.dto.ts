import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/data-query/dto/data-query.dto';

class GetSustainabilityRoadmapBaseDto {
  @ApiPropertyOptional({
    description: 'Filter by year (partial match)',
    example: '2024',
  })
  @IsOptional()
  @IsString()
  year?: string;

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

export class GetSustainabilityRoadmapDto extends IntersectionType(
  GetSustainabilityRoadmapBaseDto,
  PaginationQueryDto,
) {}
