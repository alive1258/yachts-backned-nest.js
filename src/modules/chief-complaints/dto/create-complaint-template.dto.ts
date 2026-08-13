import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateComplaintTemplateDto {
  @ApiProperty({ description: 'Complaint name', example: 'Recurrent migraine' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;
}

export class ComplaintTemplateResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
