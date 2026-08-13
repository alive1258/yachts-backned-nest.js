import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/data-query/dto/data-query.dto';

class GetQuestionAnswerBaseDto {
  @ApiPropertyOptional({
    description:
      'Filter question answers by question (partial match supported).',
    example: 'Enterprise Plan',
  })
  @IsOptional()
  @IsString({ message: 'Question must be a string.' })
  question?: string;

  @ApiPropertyOptional({
    description: 'Filter question answers by answer (partial match supported).',
    example: 'Best suited for large organizations with custom needs.',
  })
  @IsOptional()
  @IsString({ message: 'Answer must be a string.' })
  answer?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_active must be a boolean value.' })
  is_active?: boolean;
}

export class GetQuestionAnswerDto extends IntersectionType(
  GetQuestionAnswerBaseDto,
  PaginationQueryDto,
) {}
