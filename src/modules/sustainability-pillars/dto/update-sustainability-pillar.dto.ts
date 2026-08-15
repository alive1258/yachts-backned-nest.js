import { PartialType } from '@nestjs/swagger';
import { CreateSustainabilityPillarDto } from './create-sustainability-pillar.dto';

export class UpdateSustainabilityPillarDto extends PartialType(
  CreateSustainabilityPillarDto,
) {}
