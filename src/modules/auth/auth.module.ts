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
import { JwtStrategy } from './presentation/strategies/jwt.strategy';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { DemoSeederService } from './application/services/demo-seeder/demo-seeder.service';
import { ViewPaginatedUsersUsecase } from './application/use-cases/view-paginated-users.usecase';
import { UpdateRoleUsecase } from './application/use-cases/update-roles.usecase';
import { IPasswordResetTokenRepository } from './domain/interfaces/password.reposiory.interface';
import { PasswordResetTokenRepository } from './infrastructure/persistence/repository/password-reset-token.repository';
import { PasswordResetTokenSchema } from './infrastructure/persistence/schema/password-reset-schema';
import { SystemUserService } from './application/services/system-user.service';
import { TokenHasherService } from './application/services/tokenHasher';
import { ITokenHasher } from './domain/interfaces/token-hasher.interface';
import { RequestPasswordResetUseCase } from './application/use-cases/request-password-reset.usecase';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.usecase';
import { IEmailSenderService } from './application/services/iemail-sender/iemail-sender.service';
import { GmailEmailService } from './application/services/gmail-sender.service';

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
    TypeOrmModule.forFeature([
      UserSchema,
      RefreshTokenSchema,
      PasswordResetTokenSchema,
    ]),
  ],
  providers: [
    // Strategies and guards
    JwtStrategy,
    // use cases
    RegisterUseCase,
    ChangePasswordUseCase,
    LoginUseCase,
    JwtService,
    AdminSeederService,
    DemoSeederService,
    RefreshTokenUseCase,
    UpdateRoleUsecase,
    SystemUserService,

    ResetPasswordUseCase,
    RequestPasswordResetUseCase,

    //Services
    PasswordHasherService,

    {
      provide: IRefreshTokenRepository,
      useClass: RefreshTokenRepository,
    },
    {
      provide: ITokenHasher,
      useClass: TokenHasherService,
    },

    PasswordResetTokenRepository,
    {
      provide: IPasswordResetTokenRepository,
      useClass: PasswordResetTokenRepository,
    },
    {
      provide: IEmailSenderService,
      useClass: GmailEmailService, // Your actual email service implementation
    },

    {
      provide: IAuthRepository,
      useClass: AuthRepository,
    },

    ResetPasswordUseCase,
    ViewPaginatedUsersUsecase,
  ],
  controllers: [AuthController],
  exports: [
    IAuthRepository,
    IRefreshTokenRepository,
    PasswordHasherService,
    JwtStrategy,
    SystemUserService,
  ],
})
export class AuthModule implements OnModuleInit {
  constructor(
    private readonly adminSeederService: AdminSeederService,
    private readonly demoSeeder: DemoSeederService,
    private readonly systemUserService: SystemUserService,
  ) {}
  async onModuleInit() {
    // Ensure system user exists
    await this.systemUserService.ensureSystemUserExists();
    await this.adminSeederService.seedDefaultAdmin();
    // await this.demoSeeder.seedDemoData();
  }
}
