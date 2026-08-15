import { Module } from '@nestjs/common';
import { AboutStatsService } from './about-stats.service';
import { AboutStatsController } from './about-stats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutStat } from './entities/about-stat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AboutStat])],
  controllers: [AboutStatsController],
  providers: [AboutStatsService],
  exports: [AboutStatsService],
})
export class AboutStatsModule {}
