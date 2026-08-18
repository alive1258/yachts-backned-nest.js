import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SearchActiveYachtsDto {
  @ApiPropertyOptional({
    description: 'Filter by cruising region (partial, case-insensitive match)',
    example: 'Mediterranean',
  })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({
    description: 'Only return yachts with guest capacity at or above this number',
    example: 6,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  guests_min?: number;
}
