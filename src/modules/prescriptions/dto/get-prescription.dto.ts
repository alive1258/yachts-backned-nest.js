import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from 'src/common/data-query/dto/data-query.dto';

class GetPrescriptionBaseDto {
  @ApiPropertyOptional({ description: 'Filter by linked appointment UUID' })
  @IsOptional()
  @IsUUID()
  appointment_id?: string;

  @ApiPropertyOptional({ description: 'Start of a prescription_date range filter' })
  @IsOptional()
  @IsDateString()
  date_from?: string;

  @ApiPropertyOptional({ description: 'End of a prescription_date range filter' })
  @IsOptional()
  @IsDateString()
  date_to?: string;
}

export class GetPrescriptionDto extends IntersectionType(
  GetPrescriptionBaseDto,
  PaginationQueryDto,
) {}
