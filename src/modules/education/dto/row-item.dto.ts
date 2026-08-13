import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RowItemDto {
  @ApiProperty({
    description: 'Lucide icon name (e.g. "GraduationCap", "Trophy")',
    example: 'GraduationCap',
  })
  @IsString()
  @IsNotEmpty()
  icon: string;

  @ApiProperty({
    description: 'Row title',
    example: 'MBBS — Bachelor of Medicine & Surgery',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Row subtitle',
    example: 'Jamalpur Medical College, Jamalpur',
  })
  @IsString()
  @IsNotEmpty()
  subtitle: string;

  @ApiPropertyOptional({
    description: 'Date range, e.g. "2015–2021"',
    example: '2015–2021',
  })
  @IsString()
  @IsOptional()
  period?: string;

  @ApiPropertyOptional({
    description: 'Marks the row as an unconfirmed placeholder entry',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  placeholder?: boolean;
}
