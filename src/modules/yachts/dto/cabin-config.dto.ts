import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CabinConfigDto {
  @ApiProperty({ description: 'Cabin type', example: 'Double' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Number of cabins of this type', example: 3 })
  @IsInt()
  @Min(0)
  count: number;
}
