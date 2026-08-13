import { PartialType } from '@nestjs/swagger';
import { CreateVideoGallaryCategoryDto } from './create-video-gallary-category.dto';

export class UpdateVideoGallaryCategoryDto extends PartialType(CreateVideoGallaryCategoryDto) {}
