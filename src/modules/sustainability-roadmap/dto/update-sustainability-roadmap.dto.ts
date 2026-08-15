import { PartialType } from '@nestjs/swagger';
import { CreateSustainabilityRoadmapDto } from './create-sustainability-roadmap.dto';

export class UpdateSustainabilityRoadmapDto extends PartialType(
  CreateSustainabilityRoadmapDto,
) {}
