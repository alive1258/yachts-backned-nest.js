import { Module } from '@nestjs/common';
import { YachtsService } from './yachts.service';
import { YachtsController } from './yachts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Yacht } from './entities/yacht.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Yacht])],
  controllers: [YachtsController],
  providers: [YachtsService],
  exports: [YachtsService],
})
export class YachtsModule {}
