import { Module } from '@nestjs/common';
import { AboutExploreService } from './about-explore.service';
import { AboutExploreController } from './about-explore.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutExploreCard } from './entities/about-explore.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AboutExploreCard])],
  controllers: [AboutExploreController],
  providers: [AboutExploreService],
  exports: [AboutExploreService],
})
export class AboutExploreModule {}
