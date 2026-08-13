import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChiefComplaintsService } from './chief-complaints.service';
import { ChiefComplaintsController } from './chief-complaints.controller';
import { ComplaintTemplate } from './entities/complaint-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ComplaintTemplate])],
  controllers: [ChiefComplaintsController],
  providers: [ChiefComplaintsService],
  exports: [ChiefComplaintsService],
})
export class ChiefComplaintsModule {}
