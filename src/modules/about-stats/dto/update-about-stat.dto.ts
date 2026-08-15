import { PartialType } from '@nestjs/swagger';
import { CreateAboutStatDto } from './create-about-stat.dto';

export class UpdateAboutStatDto extends PartialType(CreateAboutStatDto) {}
