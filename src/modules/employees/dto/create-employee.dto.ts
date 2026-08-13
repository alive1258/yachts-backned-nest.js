import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '017XXXXXXXX' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  mobile: string;

  @ApiProperty({ example: 'staff@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password123@' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(255)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, {
    message:
      'Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  // Staff accounts take any dynamic role except the built-in Super Admin
  // role — there is exactly one way to become Super Admin: being seeded
  // directly in the database. Validated in EmployeesService against the
  // Role table (must exist, is_staff true, is_system false), since the
  // set of assignable roles is no longer a fixed compile-time list.
  @ApiProperty({ description: 'Role UUID to assign to this staff account' })
  @IsUUID()
  role_id: string;

  @ApiPropertyOptional({ example: 'Front Desk Coordinator' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  designation?: string;

  @ApiPropertyOptional({ example: 'Reception' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;
}
