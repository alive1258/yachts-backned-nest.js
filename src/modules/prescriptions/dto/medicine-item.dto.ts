import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class MedicineItemDto {
  @ApiProperty({ description: 'Medicine name', example: 'Napa (Paracetamol)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Dosage/strength', example: '500mg' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  dosage?: string;

  @ApiPropertyOptional({
    description: 'Dosing frequency, e.g. morning+afternoon+night',
    example: '1+0+1',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  frequency?: string;

  @ApiPropertyOptional({ description: 'Duration', example: '5 days' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  duration?: string;

  @ApiPropertyOptional({
    description: 'Instructions',
    example: 'After meal',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  instructions?: string;
}
