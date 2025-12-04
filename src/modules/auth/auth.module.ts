import { Module, OnModuleInit } from '@nestjs/common';

import { RegisterUseCase } from './application/use-cases/register.use-case.ts/register-use-case.service';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case/change-password-use-case.service';
import { AuthController } from './presentation/auth.controller/auth.controller.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSchema } from './infrastructure/persistence/schema/user.schema';
import { RefreshTokenSchema } from './infrastructure/persistence/schema/refresh-token.schema';
import { IRefreshTokenRepository } from './domain/interfaces/refresh-token.repository';
import { RefreshTokenRepository } from './infrastructure/persistence/repository/refres-token.repository';
import { IAuthRepository } from './domain/interfaces/auth.repository.interface';
import AuthRepository from './infrastructure/persistence/repository/auth.repository';
import { PasswordHasherService } from './application/services/password-hasher-service/password-hasher-service.service';
import { LoginUseCase } from './application/use-cases/login.use-case.ts/login.use-case';
import { JwtService } from './application/services/jwt-service/jwt-service.service';
import { AdminSeederService } from './application/services/admin-seeder/admin-seeder.service';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case/reset-password.use-case';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get(`JWT_EXPIRATION`, `15m`),
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([UserSchema, RefreshTokenSchema]),
  ],
  providers: [
    // Strategies and guards

    // use cases
    RegisterUseCase,
    ChangePasswordUseCase,
    LoginUseCase,
    JwtService,
    AdminSeederService,

    //Services
    PasswordHasherService,

    {
      provide: IRefreshTokenRepository,
      useClass: RefreshTokenRepository,
    },

    {
      provide: IAuthRepository,
      useClass: AuthRepository,
    },

    ResetPasswordUseCase,
  ],
  controllers: [AuthController],
  exports: [IAuthRepository, IRefreshTokenRepository, PasswordHasherService],
})
export class AuthModule implements OnModuleInit {
  constructor(private readonly adminSeederService: AdminSeederService) {}
  async onModuleInit() {
    await this.adminSeederService.seedDefaultAdmin();
  }
}
