import { Module } from '@nestjs/common';
import { InnovationConceptsService } from './innovation-concepts.service';
import { InnovationConceptsController } from './innovation-concepts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InnovationConcept } from './entities/innovation-concept.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InnovationConcept])],
  controllers: [InnovationConceptsController],
  providers: [InnovationConceptsService],
  exports: [InnovationConceptsService],
})
export class InnovationConceptsModule {}
