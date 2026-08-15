import { Module } from '@nestjs/common';
import { LifeAboardPhotosService } from './life-aboard-photos.service';
import { LifeAboardPhotosController } from './life-aboard-photos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LifeAboardPhoto } from './entities/life-aboard-photo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LifeAboardPhoto])],
  controllers: [LifeAboardPhotosController],
  providers: [LifeAboardPhotosService],
  exports: [LifeAboardPhotosService],
})
export class LifeAboardPhotosModule {}
