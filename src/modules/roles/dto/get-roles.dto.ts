import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from 'src/common/data-query/dto/data-query.dto';

class GetRolesBaseDto {
  @ApiPropertyOptional({
    description:
      'Include customer-facing (non-staff) roles in the results. Defaults to false — this endpoint normally only lists roles that appear in the admin Roles UI.',
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  include_non_staff?: boolean;
}

export class GetRolesDto extends IntersectionType(
  GetRolesBaseDto,
  PaginationQueryDto,
) {}
