import { PartialType } from '@nestjs/swagger';
import { CreateClientVideoReviewDto } from './create-client-video-review.dto';

export class UpdateClientVideoReviewDto extends PartialType(
  CreateClientVideoReviewDto,
) {}
