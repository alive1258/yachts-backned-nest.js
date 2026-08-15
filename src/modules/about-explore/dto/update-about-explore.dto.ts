import { PartialType } from '@nestjs/swagger';
import { CreateAboutExploreDto } from './create-about-explore.dto';

export class UpdateAboutExploreDto extends PartialType(CreateAboutExploreDto) {}
