import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class TestItemDto {
  @ApiProperty({ description: 'Test name', example: 'CBC (Complete Blood Count)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Instructions',
    example: 'Fasting sample required',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  instructions?: string;
}
