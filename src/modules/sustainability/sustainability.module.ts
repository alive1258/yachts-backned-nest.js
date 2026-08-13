import { Module } from '@nestjs/common';
import { SustainabilityService } from './sustainability.service';
import { SustainabilityController } from './sustainability.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sustainability } from './entities/sustainability.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sustainability])],
  controllers: [SustainabilityController],
  providers: [SustainabilityService],
  exports: [SustainabilityService],
})
export class SustainabilityModule {}
