import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { UpdateUserDto } from './update-user.dto';

// Only reachable via the admin-only PATCH /:id/admin route. Carries the
// privilege-sensitive fields that must never be settable through the
// self-service UpdateUserDto.
export class AdminUpdateUserDto extends UpdateUserDto {
  @ApiPropertyOptional({ description: 'Role UUID to assign' })
  @IsOptional()
  @IsUUID()
  role_id?: string;

  @ApiPropertyOptional({ description: 'Whether the account is active' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Whether the account is verified' })
  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;
}
