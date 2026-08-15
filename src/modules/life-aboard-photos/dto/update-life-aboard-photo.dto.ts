import { PartialType } from '@nestjs/swagger';
import { CreateLifeAboardPhotoDto } from './create-life-aboard-photo.dto';

export class UpdateLifeAboardPhotoDto extends PartialType(
  CreateLifeAboardPhotoDto,
) {}
