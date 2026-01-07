// system-user.service.ts
import { Injectable, Logger, Inject } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { IAuthRepository } from '../../domain/interfaces/auth.repository.interface';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/Password.vo';
import { Role } from '../../policies/rbac.policy';
import { PasswordHasherService } from './password-hasher-service/password-hasher-service.service';

@Injectable()
export class SystemUserService {
  private readonly logger = new Logger(SystemUserService.name);
  public readonly SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';
  private readonly SYSTEM_EMAIL = 'system@helapay.africa';
  private readonly SYSTEM_PASSWORD = 'System@Password123!'; // Should be strong and never used

  constructor(
    @Inject(IAuthRepository)
    private readonly authRepository: IAuthRepository,
    private readonly passwordHasher: PasswordHasherService,
  ) {}

  async ensureSystemUserExists(): Promise<User> {
    const emailVO = new Email(this.SYSTEM_EMAIL);

    try {
      // Try to find existing system user
      let systemUser = await this.authRepository.findByEmail(emailVO);

      if (!systemUser) {
        // If not found by email, try by ID
        systemUser = await this.authRepository.findById(this.SYSTEM_USER_ID);
      }

      if (systemUser) {
        this.logger.log('System user already exists');
        return systemUser;
      }

      // Create new system user
      const hashedPassword = await this.passwordHasher.hash(
        this.SYSTEM_PASSWORD,
      );
      const securePassword = new Password(hashedPassword, true);

      systemUser = new User({
        id: this.SYSTEM_USER_ID, // Set the predefined ID
        email: emailVO,
        firstName: 'System',
        lastName: 'User',
        password: securePassword,
        role: Role.SYSTEM, // You might want to create a SYSTEM role
      });

      console.log('=== DEBUG: Creating system user ===');
      console.log('System User ID:', systemUser.id);
      console.log('System User Email:', systemUser.email.value);

      await this.authRepository.save(systemUser);
      this.logger.log('✅ System user created successfully');

      return systemUser;
    } catch (error: any) {
      this.logger.error('Failed to create system user:', error.message);
      this.logger.error(error.stack);
      throw error;
    }
  }

  getSystemUserId(): string {
    return this.SYSTEM_USER_ID;
  }

  getSystemUserEmail(): string {
    return this.SYSTEM_EMAIL;
  }
}
