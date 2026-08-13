// import { forwardRef, Global, Module } from '@nestjs/common';
// import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';
// import { SignInProvider } from './providers/sign-in.provider';
// import { GenerateTokensProvider } from './providers/generate-tokens.provider';
// import { RefreshTokensProvider } from './providers/refresh-tokens.provider';
// import { VerifyOTPProvider } from './providers/veryfy-otp.provider';
// import { UsersModule } from 'src/modules/users/users.module';
// import { ConfigModule } from '@nestjs/config';
// import jwtConfig from './config/jwt.config';
// import { JwtModule } from '@nestjs/jwt';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { User } from 'src/modules/users/entities/user.entity';
// import { HashingProvider } from './providers/hashing.provider';
// import { BcryptProvider } from './providers/bcrypt.provider';

// @Global()
// @Module({
//   imports: [
//     forwardRef(() => UsersModule),
//     ConfigModule.forFeature(jwtConfig),
//     JwtModule.registerAsync(jwtConfig.asProvider()),
//     TypeOrmModule.forFeature([User]),
//   ],
//   controllers: [AuthController],
//   providers: [
//     AuthService,
//     {
//       provide: HashingProvider,
//       useClass: BcryptProvider,
//     },
//     SignInProvider,
//     GenerateTokensProvider,
//     RefreshTokensProvider,
//     VerifyOTPProvider,
//   ],

//   exports: [AuthService, HashingProvider, JwtModule, ConfigModule],
// })
// export class AuthModule {}

import { forwardRef, Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignInProvider } from './providers/sign-in.provider';
import { GenerateTokensProvider } from './providers/generate-tokens.provider';
import { RefreshTokensProvider } from './providers/refresh-tokens.provider';
import { VerifyOTPProvider } from './providers/veryfy-otp.provider';
import { UsersModule } from 'src/modules/users/users.module';
import { ConfigModule, ConfigType } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import { HashingProvider } from './providers/hashing.provider';
import { BcryptProvider } from './providers/bcrypt.provider';
import { AdminSignInProvider } from './providers/admin-sign-in.provider';
import { RolesModule } from 'src/modules/roles/roles.module';


@Global()
@Module({
  imports: [
    forwardRef(() => UsersModule),
    RolesModule,
    ConfigModule.forFeature(jwtConfig),

    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfig)],
      inject: [jwtConfig.KEY],
      useFactory: (config: ConfigType<typeof jwtConfig>) => ({
        secret: config.accessSecret, // <-- required
        signOptions: {
          expiresIn: config.accessTokenTlt, // <-- access token TTL
          issuer: config.issuer,
          audience: config.audience,
        },
      }),
    }),

    TypeOrmModule.forFeature([User, Role]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
    SignInProvider,
    AdminSignInProvider,
    GenerateTokensProvider,
    RefreshTokensProvider,
    VerifyOTPProvider,
    
  ],
  exports: [AuthService, HashingProvider, JwtModule,],
})
export class AuthModule {}
