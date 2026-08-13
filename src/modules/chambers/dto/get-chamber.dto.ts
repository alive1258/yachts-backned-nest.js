import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PaginationQueryDto } from 'src/common/data-query/dto/data-query.dto';

class GetChamberBaseDto {
  @ApiPropertyOptional({
    description: 'Filter by location name (partial match)',
    example: 'Pranto',
  })
  @IsOptional()
  @IsString()
  location_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(6)
  day_of_week?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active?: boolean;
}

export class GetChamberDto extends IntersectionType(
  GetChamberBaseDto,
  PaginationQueryDto,
) {}
