import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/data-query/dto/data-query.dto';

class GetDestinationBaseDto {
  @ApiPropertyOptional({
    description: 'Filter by name (partial match)',
    example: 'Greek',
  })
  @IsOptional()
  @IsString()
  name?: string;

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

export class GetDestinationDto extends IntersectionType(
  GetDestinationBaseDto,
  PaginationQueryDto,
) {}
