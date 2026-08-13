import { PartialType } from '@nestjs/swagger';
import { CreateVideoGallaryDto } from './create-video-gallary.dto';

export class UpdateVideoGallaryDto extends PartialType(CreateVideoGallaryDto) {}
