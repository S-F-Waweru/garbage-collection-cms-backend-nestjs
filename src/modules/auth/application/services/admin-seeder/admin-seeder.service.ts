import { Injectable, Logger, Inject } from '@nestjs/common';
import { IAuthRepository } from '../../../domain/interfaces/auth.repository.interface';
import { PasswordHasherService } from '../password-hasher-service/password-hasher-service.service';
import { Email } from '../../../domain/value-objects/email.vo';
import { Password } from '../../../domain/value-objects/Password.vo';
import { User } from '../../../domain/entities/user.entity';
import { Role } from '../../../policies/rbac.policy';

@Injectable()
export class AdminSeederService {
  private readonly logger = new Logger(AdminSeederService.name);

  constructor(
    @Inject(IAuthRepository)
    private readonly authRepository: IAuthRepository,
    private readonly passwordHasher: PasswordHasherService,
  ) {}

  async seedDefaultAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@helapay.africa';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    try {
      const emailVO = new Email(adminEmail);
      const exists = await this.authRepository.findByEmail(emailVO);

      if (exists) {
        this.logger.log('Default admin already exists');
        return;
      }

      // Create admin user
      const hashedPassword = await this.passwordHasher.hash(adminPassword);
      const securePassword = new Password(hashedPassword, true);

      const adminUser = new User({
        email: emailVO,
        firstName: 'System',
        lastName: 'Administrator',
        password: securePassword,
        role: Role.ADMIN,
      });

      console.log('=== DEBUG: Creating default admin user ===');
      console.log('debug: AdminUser:', adminUser);

      await this.authRepository.save(adminUser);

      this.logger.log(`✅ Default admin created: ${adminEmail}`);
      this.logger.warn(
        `⚠️  Default password: ${adminPassword} - CHANGE IT IMMEDIATELY! and Default role: ${adminUser.role}`,
      );
    } catch (error: any) {
      this.logger.error('Failed to seed default admin:', error.message);
    }
  }
}
