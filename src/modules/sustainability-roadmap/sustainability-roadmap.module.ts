import { Module } from '@nestjs/common';
import { SustainabilityRoadmapService } from './sustainability-roadmap.service';
import { SustainabilityRoadmapController } from './sustainability-roadmap.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SustainabilityRoadmapItem } from './entities/sustainability-roadmap.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SustainabilityRoadmapItem])],
  controllers: [SustainabilityRoadmapController],
  providers: [SustainabilityRoadmapService],
  exports: [SustainabilityRoadmapService],
})
export class SustainabilityRoadmapModule {}
