import { Module } from '@nestjs/common';
import { ChambersService } from './chambers.service';
import { ChambersController } from './chambers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chamber } from './entities/chamber.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chamber])],
  controllers: [ChambersController],
  providers: [ChambersService],
  exports: [ChambersService],
})
export class ChambersModule {}
