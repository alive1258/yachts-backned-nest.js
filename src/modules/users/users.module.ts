// import { forwardRef, Module } from '@nestjs/common';
// import { UsersService } from './users.service';
// import { UsersController } from './users.controller';
// import { CreateUserProvider } from './providers/create-user.provider';
// import { FindOneUserByEmailProvider } from './providers/find-one-user-by-email.provider';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { User } from './entities/user.entity';
// import { ConfigModule } from '@nestjs/config';
// import profileConfig from './config/profile.config';
// import jwtConfig from 'src/auth/config/jwt.config';
// import { AuthModule } from 'src/auth/auth.module';
// import { JwtModule } from '@nestjs/jwt';

// @Module({
//   imports: [
//     TypeOrmModule.forFeature([User]),
//     forwardRef(() => AuthModule),
//     ConfigModule.forFeature(profileConfig),
//     ConfigModule.forFeature(jwtConfig),
//     JwtModule.registerAsync(jwtConfig.asProvider()),
//   ],
//   controllers: [UsersController],
//   providers: [UsersService, CreateUserProvider, FindOneUserByEmailProvider],

//   exports: [UsersService],
// })
// export class UsersModule {}

import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CreateUserProvider } from './providers/create-user.provider';
import { FindOneUserByEmailProvider } from './providers/find-one-user-by-email.provider';
import { SuperAdminSeederProvider } from './providers/super-admin-seeder.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import { ConfigModule, ConfigType } from '@nestjs/config';
import profileConfig from './config/profile.config';
import jwtConfig from 'src/auth/config/jwt.config';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    forwardRef(() => AuthModule),
    ConfigModule.forFeature(profileConfig),
    ConfigModule.forFeature(jwtConfig),

    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfig)],
      inject: [jwtConfig.KEY],
      useFactory: (config: ConfigType<typeof jwtConfig>) => ({
        secret: config.accessSecret, // <-- must be `secret`
        signOptions: {
          expiresIn: config.accessTokenTlt, // <-- access token TTL
          issuer: config.issuer,
          audience: config.audience,
        },
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    CreateUserProvider,
    FindOneUserByEmailProvider,
    SuperAdminSeederProvider,
  ],
  exports: [UsersService],
})
export class UsersModule {}
