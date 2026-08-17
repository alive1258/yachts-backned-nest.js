import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { Menu } from 'src/modules/menu/entities/menu.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RolePermissionLookupProvider } from './providers/role-permission-lookup.provider';
import { RoleSeederProvider } from './providers/role-seeder.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Role, RolePermission, Menu, User])],
  controllers: [RolesController],
  providers: [RolesService, RolePermissionLookupProvider, RoleSeederProvider],
  exports: [RolesService, RolePermissionLookupProvider],
})
export class RolesModule {}
