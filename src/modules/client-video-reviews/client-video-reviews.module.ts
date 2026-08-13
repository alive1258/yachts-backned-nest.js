import { Module } from '@nestjs/common';
import { ClientVideoReviewsService } from './client-video-reviews.service';
import { ClientVideoReviewsController } from './client-video-reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientVideoReview } from './entities/client-video-review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClientVideoReview])],
  controllers: [ClientVideoReviewsController],
  providers: [ClientVideoReviewsService],
  exports: [ClientVideoReviewsService],
})
export class ClientVideoReviewsModule {}
