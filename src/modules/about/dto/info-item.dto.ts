import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class InfoItemDto {
  @ApiProperty({
    description: 'Lucide icon name (e.g. "GraduationCap", "Briefcase")',
    example: 'GraduationCap',
  })
  @IsString()
  @IsNotEmpty()
  icon: string;

  @ApiProperty({
    description: 'Info label',
    example: 'Qualifications',
  })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({
    description: 'Info value',
    example: 'MBBS (DU), CMU, MS Neurosurgery (Course)',
  })
  @IsString()
  @IsNotEmpty()
  value: string;
}
