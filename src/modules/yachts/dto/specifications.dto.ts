import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CabinConfigDto } from './cabin-config.dto';

export class AccommodationDto {
  @ApiProperty({ description: 'Guests when day-cruising', example: 16 })
  @IsInt()
  @Min(0)
  guestsCruising: number;

  @ApiProperty({ description: 'Guests when sleeping aboard', example: 10 })
  @IsInt()
  @Min(0)
  guestsSleeping: number;

  @ApiProperty({ description: 'Number of staterooms', example: 5 })
  @IsInt()
  @Min(0)
  staterooms: number;

  @ApiProperty({ description: 'Cabin configuration', type: [CabinConfigDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CabinConfigDto)
  cabinConfig: CabinConfigDto[];

  @ApiProperty({ description: 'Crew size', example: 7 })
  @IsInt()
  @Min(0)
  crew: number;
}

export class ConstructionDto {
  @ApiProperty({ description: 'Year built', example: 2020 })
  @IsInt()
  builtYear: number;

  @ApiProperty({ description: 'Year of last refit', example: 2023 })
  @IsInt()
  refitYear: number;

  @ApiProperty({ description: 'Shipyard/builder', example: 'Eco Yachts Shipyard' })
  @IsString()
  @IsNotEmpty()
  builder: string;

  @ApiProperty({ description: 'Hull material', example: 'Aluminium' })
  @IsString()
  @IsNotEmpty()
  hullMaterial: string;

  @ApiProperty({
    description: 'Exterior designer',
    example: 'Eco Yachts Design Studio',
  })
  @IsString()
  @IsNotEmpty()
  exteriorDesigner: string;

  @ApiProperty({
    description: 'Interior designer',
    example: 'Eco Yachts Design Studio',
  })
  @IsString()
  @IsNotEmpty()
  interiorDesigner: string;
}

export class DimensionsDto {
  @ApiProperty({ description: 'Length', example: "27m (88')" })
  @IsString()
  @IsNotEmpty()
  length: string;

  @ApiProperty({ description: 'Beam', example: '4.32m' })
  @IsString()
  @IsNotEmpty()
  beam: string;

  @ApiProperty({ description: 'Draft', example: '1.62m' })
  @IsString()
  @IsNotEmpty()
  draft: string;

  @ApiProperty({ description: 'Gross tonnage', example: '656 GT' })
  @IsString()
  @IsNotEmpty()
  grossTonnage: string;
}

export class PerformanceDto {
  @ApiProperty({ description: 'Cruising speed', example: '10 Knots' })
  @IsString()
  @IsNotEmpty()
  cruisingSpeed: string;

  @ApiProperty({ description: 'Maximum speed', example: '15 Knots' })
  @IsString()
  @IsNotEmpty()
  maxSpeed: string;

  @ApiProperty({ description: 'Range', example: '3,000 nm' })
  @IsString()
  @IsNotEmpty()
  range: string;

  @ApiProperty({
    description: 'Engines',
    example: '2 x Hybrid-Electric Diesel (1,050 hp)',
  })
  @IsString()
  @IsNotEmpty()
  engines: string;

  @ApiProperty({
    description: 'Generators',
    example: '2 x Hybrid-Ready Marine Generators',
  })
  @IsString()
  @IsNotEmpty()
  generators: string;
}

export class ClassificationInfoDto {
  @ApiProperty({
    description: 'Classification society / registry',
    example: "Lloyd's Register / Green Passport",
  })
  @IsString()
  @IsNotEmpty()
  classification: string;

  @ApiProperty({ description: 'Flag state', example: 'Malta' })
  @IsString()
  @IsNotEmpty()
  flag: string;
}

export class SpecificationsDto {
  @ApiProperty({ type: AccommodationDto })
  @ValidateNested()
  @Type(() => AccommodationDto)
  accommodation: AccommodationDto;

  @ApiProperty({ type: ConstructionDto })
  @ValidateNested()
  @Type(() => ConstructionDto)
  construction: ConstructionDto;

  @ApiProperty({ type: DimensionsDto })
  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions: DimensionsDto;

  @ApiProperty({ type: PerformanceDto })
  @ValidateNested()
  @Type(() => PerformanceDto)
  performance: PerformanceDto;

  @ApiProperty({ type: ClassificationInfoDto })
  @ValidateNested()
  @Type(() => ClassificationInfoDto)
  classification: ClassificationInfoDto;

  @ApiProperty({
    description: 'Onboard amenities',
    type: [String],
    example: ['WiFi', 'Air Conditioning', 'Water Toys'],
  })
  @IsArray()
  @IsString({ each: true })
  amenities: string[];
}
