import { Module } from '@nestjs/common';
import { SustainabilityIntroService } from './sustainability-intro.service';
import { SustainabilityIntroController } from './sustainability-intro.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SustainabilityIntro } from './entities/sustainability-intro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SustainabilityIntro])],
  controllers: [SustainabilityIntroController],
  providers: [SustainabilityIntroService],
  exports: [SustainabilityIntroService],
})
export class SustainabilityIntroModule {}
