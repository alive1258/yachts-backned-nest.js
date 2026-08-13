import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class RolePermissionGrantDto {
  @ApiProperty({ description: 'Menu UUID this grant applies to' })
  @IsUUID()
  menu_id: string;

  @ApiProperty()
  @IsBoolean()
  can_view: boolean;

  @ApiProperty()
  @IsBoolean()
  can_create: boolean;

  @ApiProperty()
  @IsBoolean()
  can_edit: boolean;

  @ApiProperty()
  @IsBoolean()
  can_delete: boolean;
}

export class UpsertRolePermissionsDto {
  @ApiProperty({ type: [RolePermissionGrantDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RolePermissionGrantDto)
  grants: RolePermissionGrantDto[];
}
