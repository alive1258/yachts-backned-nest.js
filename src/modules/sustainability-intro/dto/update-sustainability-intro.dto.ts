import { PartialType } from '@nestjs/swagger';
import { CreateSustainabilityIntroDto } from './create-sustainability-intro.dto';

export class UpdateSustainabilityIntroDto extends PartialType(
  CreateSustainabilityIntroDto,
) {}
