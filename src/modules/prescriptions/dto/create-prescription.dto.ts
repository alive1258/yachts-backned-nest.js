import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { PatientGender } from '../entities/prescription.entity';
import { MedicineItemDto } from './medicine-item.dto';
import { TestItemDto } from './test-item.dto';
import { ChiefComplaintItemDto } from './chief-complaint-item.dto';

export class CreatePrescriptionDto {
  @ApiProperty({ description: 'Patient name', example: 'Rahim Uddin' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  patient_name: string;

  @ApiPropertyOptional({ description: 'Patient age in years', example: 34 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(150)
  @IsOptional()
  patient_age?: number;

  @ApiPropertyOptional({ enum: PatientGender })
  @IsEnum(PatientGender)
  @IsOptional()
  patient_gender?: PatientGender;

  @ApiPropertyOptional({ example: '01712345678' })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  patient_phone?: string;

  @ApiPropertyOptional({ example: 'Mirpur, Dhaka' })
  @IsString()
  @IsOptional()
  patient_address?: string;

  @ApiPropertyOptional({
    description: 'Appointment this prescription was written for',
  })
  @IsUUID()
  @IsOptional()
  appointment_id?: string;

  @ApiPropertyOptional({
    description: 'Diagnosis notes',
    example: 'Recurrent tension headaches, no red-flag symptoms.',
  })
  @IsString()
  @IsOptional()
  diagnosis?: string;

  @ApiPropertyOptional({ type: [ChiefComplaintItemDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ChiefComplaintItemDto)
  chief_complaints?: ChiefComplaintItemDto[];

  @ApiPropertyOptional({ type: [MedicineItemDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MedicineItemDto)
  medicines?: MedicineItemDto[];

  @ApiPropertyOptional({ type: [TestItemDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TestItemDto)
  tests?: TestItemDto[];

  @ApiPropertyOptional({
    description: 'General advice / notes',
    example: 'Adequate hydration, reduce screen time, avoid skipping meals.',
  })
  @IsString()
  @IsOptional()
  advice?: string;

  @ApiPropertyOptional({ description: 'Follow-up date', example: '2026-03-20' })
  @IsDateString()
  @IsOptional()
  follow_up_date?: string;

  @ApiPropertyOptional({
    description: 'Prescription date (defaults to today)',
    example: '2026-03-10',
  })
  @IsDateString()
  @IsOptional()
  prescription_date?: string;
}

export class PrescriptionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  patient_name: string;

  @ApiPropertyOptional()
  patient_age?: number;

  @ApiPropertyOptional({ enum: PatientGender })
  patient_gender?: PatientGender;

  @ApiPropertyOptional()
  patient_phone?: string;

  @ApiPropertyOptional()
  patient_address?: string;

  @ApiPropertyOptional()
  appointment_id?: string;

  @ApiPropertyOptional()
  diagnosis?: string;

  @ApiPropertyOptional({ type: [ChiefComplaintItemDto] })
  chief_complaints?: ChiefComplaintItemDto[];

  @ApiPropertyOptional({ type: [MedicineItemDto] })
  medicines?: MedicineItemDto[];

  @ApiPropertyOptional({ type: [TestItemDto] })
  tests?: TestItemDto[];

  @ApiPropertyOptional()
  advice?: string;

  @ApiPropertyOptional()
  follow_up_date?: string;

  @ApiProperty()
  prescription_date: string;

  @ApiProperty()
  share_token: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiPropertyOptional()
  deleted_at?: Date;
}
