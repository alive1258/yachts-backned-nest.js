import { ApiProperty } from '@nestjs/swagger';

export class RolePermissionMatrixRowDto {
  @ApiProperty({ description: 'Menu UUID' })
  menu_id: string;

  @ApiProperty({ description: 'Menu stable key' })
  menu_key: string;

  @ApiProperty({ description: 'Menu display label' })
  menu_label: string;

  @ApiProperty()
  can_view: boolean;

  @ApiProperty()
  can_create: boolean;

  @ApiProperty()
  can_edit: boolean;

  @ApiProperty()
  can_delete: boolean;
}
