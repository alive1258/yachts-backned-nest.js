import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/data-query/dto/data-query.dto';

class GetSustainabilityPillarBaseDto {
  @ApiPropertyOptional({
    description: 'Filter by title (partial match)',
    example: 'Fleet Electrification',
  })
  @IsOptional()
  @IsString()
  title?: string;

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

export class GetSustainabilityPillarDto extends IntersectionType(
  GetSustainabilityPillarBaseDto,
  PaginationQueryDto,
) {}
