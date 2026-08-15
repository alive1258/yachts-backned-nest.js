import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RateDto {
  @ApiProperty({ description: 'Season name', example: 'Summer' })
  @IsString()
  @IsNotEmpty()
  season: string;

  @ApiProperty({ description: 'Date range', example: 'May – September' })
  @IsString()
  @IsNotEmpty()
  dateRange: string;

  @ApiProperty({ description: 'Cruising region', example: 'Mediterranean' })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty({ description: 'Low season rate', example: '$4,600 p/night' })
  @IsString()
  @IsNotEmpty()
  lowSeason: string;

  @ApiProperty({ description: 'High season rate', example: '$5,428 p/night' })
  @IsString()
  @IsNotEmpty()
  highSeason: string;
}
