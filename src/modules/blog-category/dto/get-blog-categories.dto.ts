import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { TransformToBoolean } from './create-blog-category.dto';
import { IntersectionType } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/data-query/dto/data-query.dto';

class GetBlogCategoriesBaseDto {
  @IsString()
  @IsOptional()
  added_by?: string;

  @TransformToBoolean()
  @IsOptional()
  @IsBoolean()
  status?: any;
}

export class GetBlogCategoriesDto extends IntersectionType(
  GetBlogCategoriesBaseDto,
  PaginationQueryDto,
) {}
