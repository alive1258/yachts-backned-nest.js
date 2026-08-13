import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class StatItemDto {
  @ApiProperty({
    description: 'Lucide icon name (e.g. "Award", "Activity", "Users")',
    example: 'Award',
  })
  @IsString()
  @IsNotEmpty()
  icon: string;

  @ApiProperty({
    description: 'Stat value',
    example: '5+ Yrs',
  })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({
    description: 'Stat label',
    example: 'In Experience',
  })
  @IsString()
  @IsNotEmpty()
  label: string;
}
