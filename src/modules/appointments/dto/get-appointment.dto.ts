import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from 'src/common/data-query/dto/data-query.dto';
import {
  AppointmentSource,
  AppointmentStatus,
  AppointmentType,
} from '../entities/appointment.entity';

class GetAppointmentBaseDto {
  @ApiPropertyOptional({ enum: AppointmentStatus })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({ enum: AppointmentSource })
  @IsOptional()
  @IsEnum(AppointmentSource)
  source?: AppointmentSource;

  @ApiPropertyOptional({ enum: AppointmentType, description: 'Filter by consultation modality' })
  @IsOptional()
  @IsEnum(AppointmentType)
  appointment_type?: AppointmentType;

  @ApiPropertyOptional({ description: 'Filter by chamber UUID' })
  @IsOptional()
  @IsUUID()
  chamber_id?: string;

  @ApiPropertyOptional({ description: 'Filter by appointment date', example: '2026-03-10' })
  @IsOptional()
  @IsDateString()
  appointment_date?: string;

  @ApiPropertyOptional({ description: 'Start of an appointment_date range filter' })
  @IsOptional()
  @IsDateString()
  date_from?: string;

  @ApiPropertyOptional({ description: 'End of an appointment_date range filter' })
  @IsOptional()
  @IsDateString()
  date_to?: string;
}

export class GetAppointmentDto extends IntersectionType(
  GetAppointmentBaseDto,
  PaginationQueryDto,
) {}
