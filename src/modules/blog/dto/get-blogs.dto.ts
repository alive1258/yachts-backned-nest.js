import { IntersectionType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/data-query/dto/data-query.dto';
import { TransformToBoolean } from 'src/modules/blog-category/dto/create-blog-category.dto';

class GetBlogsBaseDto {
  @IsString()
  @IsOptional()
  category_id?: string;

  @IsString()
  @IsOptional()
  added_by?: string;

  @TransformToBoolean()
  @IsOptional()
  @IsBoolean()
  status?: any;

  @TransformToBoolean()
  @IsOptional()
  @IsBoolean()
  is_featured?: any;
}

export class GetBlogsDto extends IntersectionType(
  GetBlogsBaseDto,
  PaginationQueryDto,
) {}
