import { Module } from '@nestjs/common';
import { VideoGallariesService } from './video-gallaries.service';
import { VideoGallariesController } from './video-gallaries.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoGallary } from './entities/video-gallary.entity';
import { VideoGallaryCategory } from '../video-gallary-categories/entities/video-gallary-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VideoGallary, VideoGallaryCategory])],
  controllers: [VideoGallariesController],
  providers: [VideoGallariesService],
  exports: [VideoGallariesService],
})
export class VideoGallariesModule {}
