import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsNumber,
  MaxLength,
  MinLength,
  IsNotEmpty,
  Matches,
  IsBoolean,
  IsOptional,
  IsInt,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Mobile number',
    example: '017XXXXXXXX',
  })
  @IsString()
  @MaxLength(20)
  mobile: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john@example.com',
  })
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(255)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, {
    message:
      'Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @ApiPropertyOptional({
    example: 30,
    description: 'Division ID',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  division_id?: number;

  @ApiPropertyOptional({
    example: 3026,
    description: 'District ID',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  district_id?: number;

  @ApiPropertyOptional({
    example: 302654,
    description: 'Upazila ID',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  upazila_id?: number;

  @ApiProperty({
    description: 'Address',
    example: 'House 12, Road 5, Dhaka',
    required: false,
  })
  @IsString()
  address: string;

  /**
   * is_verified
   */

  @IsBoolean()
  @IsOptional()
  is_verified?: boolean;
}

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: string;

  @ApiProperty({ example: 'John Doe', required: false })
  name?: string;

  @ApiProperty({ example: '017XXXXXXXX' })
  mobile: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'user' })
  role: string;

  @ApiProperty({ example: false })
  is_verified: boolean;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z', required: false })
  email_verified_at?: Date;

  @ApiProperty({ example: 'House 12, Road 5, Dhaka', required: false })
  address?: string;

  @ApiProperty({ example: 1, required: false })
  division_id?: number;

  @ApiProperty({ example: 10, required: false })
  district_id?: number;

  @ApiProperty({ example: 101, required: false })
  upazila_id?: number;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  updated_at: Date;
}
