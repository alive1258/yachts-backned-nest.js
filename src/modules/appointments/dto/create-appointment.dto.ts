import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  AppointmentType,
  Gender,
  PatientType,
} from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'Patient full name', example: 'Rahim Uddin' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  full_name: string;

  @ApiProperty({ description: 'Patient phone number', example: '01712345678' })
  @Matches(/^[+\d][\d\s-]{6,}$/, { message: 'Enter a valid phone number' })
  phone: string;

  @ApiProperty({
    description: 'Patient email address',
    example: 'rahim@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Date of birth', example: '1990-05-12' })
  @IsDateString()
  @IsOptional()
  dob?: string;

  @ApiPropertyOptional({ description: 'Patient gender', enum: Gender })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({
    description: 'Age in completed years at time of booking',
    example: 32,
  })
  @IsInt()
  @Min(0)
  @Max(150)
  @IsOptional()
  age_years?: number;

  @ApiPropertyOptional({
    description: 'Age — additional completed months beyond age_years',
    example: 3,
  })
  @IsInt()
  @Min(0)
  @Max(11)
  @IsOptional()
  age_months?: number;

  @ApiPropertyOptional({
    description: 'Age — additional days beyond age_years/age_months',
    example: 10,
  })
  @IsInt()
  @Min(0)
  @Max(30)
  @IsOptional()
  age_days?: number;

  @ApiProperty({
    description: 'Reason for visit / service',
    example: 'General Medicine',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  service: string;

  @ApiProperty({
    description: 'Patient type',
    enum: PatientType,
    default: PatientType.NEW,
  })
  @IsEnum(PatientType)
  @IsOptional()
  patient_type?: PatientType;

  @ApiPropertyOptional({
    description: 'Notes / symptoms',
    example: 'Recurring headaches for the past two weeks.',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;

  @ApiProperty({
    description: 'Requested appointment date',
    example: '2026-03-10',
  })
  @IsDateString()
  appointment_date: string;

  @ApiPropertyOptional({
    description:
      "Chamber to book into. If omitted, resolved automatically from appointment_date's weekday. If provided, must be the chamber actually scheduled on that weekday.",
  })
  @IsUUID()
  @IsOptional()
  chamber_id?: string;

  @ApiPropertyOptional({
    description: 'Consultation modality',
    enum: AppointmentType,
    default: AppointmentType.ON_CHAMBER,
  })
  @IsEnum(AppointmentType)
  @IsOptional()
  appointment_type?: AppointmentType;
}

export class AppointmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  full_name: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  dob?: string;

  @ApiPropertyOptional({ enum: Gender })
  gender?: Gender;

  @ApiPropertyOptional()
  age_years?: number;

  @ApiPropertyOptional()
  age_months?: number;

  @ApiPropertyOptional()
  age_days?: number;

  @ApiProperty()
  service: string;

  @ApiProperty({ enum: PatientType })
  patient_type: PatientType;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  chamber_id: string;

  @ApiProperty()
  appointment_date: string;

  @ApiProperty()
  serial_number: number;

  @ApiProperty()
  estimated_time: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  source: string;

  @ApiProperty({ enum: AppointmentType })
  appointment_type: AppointmentType;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiPropertyOptional()
  deleted_at?: Date;
}
