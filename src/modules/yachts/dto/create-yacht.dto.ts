import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { TransformToBoolean } from 'src/modules/blog-category/dto/create-blog-category.dto';
import { RateDto } from './rate.dto';
import { SpecificationsDto } from './specifications.dto';

const parseJsonArray = ({ value }: { value: unknown }) => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
};

const parseJsonObject = <T extends object>(cls: new () => T) =>
  ({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      try {
        return plainToInstance(cls, JSON.parse(value));
      } catch {
        return value;
      }
    }
    return value;
  };

export class CreateYachtDto {
  @ApiPropertyOptional({
    description:
      'URL-friendly identifier. Auto-generated from the name when omitted.',
    example: 'eco-voyager',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase, alphanumeric, and hyphen-separated',
  })
  slug?: string;

  @ApiProperty({ description: 'Yacht name', example: 'Eco Voyager' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'One-line tagline',
    example: 'The fleet flagship for extended, long-range charters',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  tagline: string;

  @ApiProperty({ description: 'Yacht category', example: 'Hybrid Motor Yacht' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  category: string;

  @ApiProperty({ description: 'Length in feet', example: 95 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  length_ft: number;

  @ApiProperty({ description: 'Length in meters', example: 29 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  length_m: number;

  @ApiProperty({ description: 'Year built', example: 2021 })
  @Type(() => Number)
  @IsInt()
  built_year: number;

  @ApiProperty({ description: 'Year of last refit', example: 2025 })
  @Type(() => Number)
  @IsInt()
  refit_year: number;

  @ApiProperty({ description: 'Guest capacity', example: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  guests: number;

  @ApiProperty({ description: 'Number of cabins', example: 6 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cabins: number;

  @ApiProperty({ description: 'Crew size', example: 8 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  crew: number;

  @ApiProperty({ description: 'Price per night', example: 5800 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price_per_night: number;

  @ApiPropertyOptional({ description: 'Currency code', example: 'USD', default: 'USD' })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({
    description: 'Rate unit label',
    example: 'per night',
    default: 'per night',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  price_unit?: string;

  @ApiProperty({ description: 'Primary cruising region', example: 'Mediterranean' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  region: string;

  @ApiProperty({ description: 'Cruising speed in knots', example: 11 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cruising_speed: number;

  @ApiProperty({ description: 'Max speed in knots', example: 16 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_speed: number;

  @ApiProperty({ description: 'Range in nautical miles', example: 3600 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  range_nm: number;

  @ApiProperty({
    description: 'Engine configuration',
    example: '2 x Hybrid-Electric Diesel (1,200 hp)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  engines: string;

  @ApiProperty({ description: 'Hull material', example: 'Steel & Aluminium Composite' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  hull_material: string;

  @ApiProperty({ description: 'Builder/shipyard', example: 'Eco Yachts Shipyard' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  builder: string;

  @ApiProperty({
    description: 'Body description paragraphs, in display order',
    type: [String],
  })
  @Transform(parseJsonArray)
  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  description: string[];

  @ApiProperty({
    description: 'Standout feature bullets',
    type: [String],
  })
  @Transform(parseJsonArray)
  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  special_features: string[];

  @ApiProperty({
    description: 'Full spec-sheet breakdown',
    type: SpecificationsDto,
  })
  @Transform(parseJsonObject(SpecificationsDto))
  @ValidateNested()
  @Type(() => SpecificationsDto)
  specifications: SpecificationsDto;

  @ApiPropertyOptional({
    description: 'Seasonal rate table',
    type: [RateDto],
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return plainToInstance(RateDto, JSON.parse(value));
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RateDto)
  rates?: RateDto[];

  @ApiPropertyOptional({
    description: 'Display order (lowest first)',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  })
  position?: number;

  @ApiPropertyOptional({ description: 'Is active', example: true, default: true })
  @TransformToBoolean()
  @IsOptional()
  @IsBoolean()
  is_active?: any;

  @ApiPropertyOptional({
    description: 'Hero image (set internally from the uploaded file)',
  })
  @IsOptional()
  hero_image?: string;

  @ApiPropertyOptional({
    description: 'Gallery image URLs (set internally from uploaded files)',
    type: [String],
  })
  @IsOptional()
  gallery?: string[];
}

export class YachtResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  tagline: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  length_ft: number;

  @ApiProperty()
  length_m: number;

  @ApiProperty()
  built_year: number;

  @ApiProperty()
  refit_year: number;

  @ApiProperty()
  guests: number;

  @ApiProperty()
  cabins: number;

  @ApiProperty()
  crew: number;

  @ApiProperty()
  price_per_night: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  price_unit: string;

  @ApiProperty()
  region: string;

  @ApiProperty()
  cruising_speed: number;

  @ApiProperty()
  max_speed: number;

  @ApiProperty()
  range_nm: number;

  @ApiProperty()
  engines: string;

  @ApiProperty()
  hull_material: string;

  @ApiProperty()
  builder: string;

  @ApiProperty()
  hero_image: string;

  @ApiProperty({ type: [String] })
  gallery: string[];

  @ApiProperty({ type: [String] })
  description: string[];

  @ApiProperty({ type: [String] })
  special_features: string[];

  @ApiProperty({ type: SpecificationsDto })
  specifications: SpecificationsDto;

  @ApiProperty({ type: [RateDto] })
  rates: RateDto[];

  @ApiProperty()
  position: number;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiPropertyOptional()
  deleted_at?: Date;
}
