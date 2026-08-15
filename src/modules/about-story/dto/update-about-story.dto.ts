import { PartialType } from '@nestjs/swagger';
import { CreateAboutStoryDto } from './create-about-story.dto';

export class UpdateAboutStoryDto extends PartialType(CreateAboutStoryDto) {}
