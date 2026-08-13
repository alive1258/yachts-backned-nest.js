import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class HighlightItemDto {
  @ApiProperty({
    description: 'Lucide icon name (e.g. "Zap", "Recycle", "Droplets")',
    example: 'Zap',
  })
  @IsString()
  @IsNotEmpty()
  icon: string;

  @ApiProperty({
    description: 'Highlight title',
    example: 'Hybrid & Electric-Powered Yachts',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Highlight description',
    example: 'Low-emission propulsion across most of our fleet.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
