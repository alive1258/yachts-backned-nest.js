import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  AppointmentStatus,
  AppointmentType,
  Gender,
  PatientType,
} from '../entities/appointment.entity';

/**
 * Deliberately NOT a PartialType(CreateAppointmentDto) — serial_number and
 * estimated_time are server-computed and must never be directly settable
 * from the request body. Changing appointment_date and/or chamber_id here
 * triggers a reassignment (recomputes chamber/serial/ETA) in the service.
 */
export class UpdateAppointmentDto {
  @ApiPropertyOptional({ example: 'Rahim Uddin' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  full_name?: string;

  @ApiPropertyOptional({ example: '01712345678' })
  @Matches(/^[+\d][\d\s-]{6,}$/, { message: 'Enter a valid phone number' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'rahim@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '1990-05-12' })
  @IsDateString()
  @IsOptional()
  dob?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({ example: 32 })
  @IsInt()
  @Min(0)
  @Max(150)
  @IsOptional()
  age_years?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsInt()
  @Min(0)
  @Max(11)
  @IsOptional()
  age_months?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsInt()
  @Min(0)
  @Max(30)
  @IsOptional()
  age_days?: number;

  @ApiPropertyOptional({ example: 'General Medicine' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  service?: string;

  @ApiPropertyOptional({ enum: PatientType })
  @IsEnum(PatientType)
  @IsOptional()
  patient_type?: PatientType;

  @ApiPropertyOptional({ example: 'Recurring headaches for the past two weeks.' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Reschedule to a new date — recomputes chamber, serial number, and ETA',
    example: '2026-03-12',
  })
  @IsDateString()
  @IsOptional()
  appointment_date?: string;

  @ApiPropertyOptional({
    description:
      'Move to a different chamber — must be scheduled on the (possibly also-updated) appointment_date\'s weekday. Recomputes serial number and ETA.',
  })
  @IsUUID()
  @IsOptional()
  chamber_id?: string;

  @ApiPropertyOptional({ enum: AppointmentStatus })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @ApiPropertyOptional({ description: 'Consultation modality', enum: AppointmentType })
  @IsEnum(AppointmentType)
  @IsOptional()
  appointment_type?: AppointmentType;
}
