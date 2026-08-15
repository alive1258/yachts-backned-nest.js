import { PartialType } from '@nestjs/swagger';
import { CreateInnovationConceptDto } from './create-innovation-concept.dto';

export class UpdateInnovationConceptDto extends PartialType(
  CreateInnovationConceptDto,
) {}
