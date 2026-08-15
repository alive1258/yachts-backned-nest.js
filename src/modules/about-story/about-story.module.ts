import { Module } from '@nestjs/common';
import { AboutStoryService } from './about-story.service';
import { AboutStoryController } from './about-story.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutStory } from './entities/about-story.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AboutStory])],
  controllers: [AboutStoryController],
  providers: [AboutStoryService],
  exports: [AboutStoryService],
})
export class AboutStoryModule {}
