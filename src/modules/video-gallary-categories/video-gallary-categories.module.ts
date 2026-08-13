import { Module } from '@nestjs/common';
import { VideoGallaryCategoriesService } from './video-gallary-categories.service';
import { VideoGallaryCategoriesController } from './video-gallary-categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoGallaryCategory } from './entities/video-gallary-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VideoGallaryCategory])],
  controllers: [VideoGallaryCategoriesController],
  providers: [VideoGallaryCategoriesService],
  exports: [VideoGallaryCategoriesService],
})
export class VideoGallaryCategoriesModule {}
