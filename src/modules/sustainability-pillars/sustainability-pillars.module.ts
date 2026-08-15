import { Module } from '@nestjs/common';
import { SustainabilityPillarsService } from './sustainability-pillars.service';
import { SustainabilityPillarsController } from './sustainability-pillars.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SustainabilityPillar } from './entities/sustainability-pillar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SustainabilityPillar])],
  controllers: [SustainabilityPillarsController],
  providers: [SustainabilityPillarsService],
  exports: [SustainabilityPillarsService],
})
export class SustainabilityPillarsModule {}
