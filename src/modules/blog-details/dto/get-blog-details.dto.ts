import { IntersectionType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/data-query/dto/data-query.dto';
import { TransformToBoolean } from 'src/modules/blog-category/dto/create-blog-category.dto';

class GetBlogDetailsBaseDto {
  @IsString()
  @IsOptional()
  blog_id?: string;

  @IsString()
  @IsOptional()
  added_by?: string;

  @TransformToBoolean()
  @IsOptional()
  @IsBoolean()
  status?: any;
}

export class GetBlogDetailsDto extends IntersectionType(
  GetBlogDetailsBaseDto,
  PaginationQueryDto,
) {}
