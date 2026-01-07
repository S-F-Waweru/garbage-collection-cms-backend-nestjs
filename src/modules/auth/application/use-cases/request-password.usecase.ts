import { Inject, Injectable } from '@nestjs/common';
import { IAuthRepository } from '../../domain/interfaces/auth.repository.interface';
import { IEmailSenderService } from '../services/iemail-sender/iemail-sender.service';
import { IPasswordResetTokenRepository } from '../../domain/interfaces/password.reposiory.interface';
import { PasswordResetToken } from '../../domain/entities/PasswordResetToken.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { TokenGeneratorService } from '../services/token-generator.service';
export interface RequestPasswordResetInput {
  email: string;
}

@Injectable()
export class RequestPasswordResetUseCase {
  constructor(
    @Inject(IAuthRepository)
    private readonly userRepository: IAuthRepository,
    @Inject(IPasswordResetTokenRepository)
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    @Inject(IEmailSenderService)
    private readonly emailSenderService: IEmailSenderService,
    private readonly tokenGeneratorService: TokenGeneratorService,
  ) {}

  async execute(input: RequestPasswordResetInput): Promise<{
    success: boolean;
    message: string;
  }> {
    // 1. Find user by email
    const emailObj = new Email(input.email);
    const user = await this.userRepository.findByEmail(emailObj);

    if (!user) {
      // ⚠️ Security: Don't reveal if user exists
      // Return success anyway to prevent email enumeration
      return {
        success: true,
        message: 'If an account exists, a password reset link has been sent.',
      };
    }

    // 2. Delete any existing reset tokens for this user
    await this.passwordResetTokenRepository.deleteByUserId(user.id);

    // 3. Generate secure token (plain text)
    const plainToken = this.tokenGeneratorService.generate(32); // 64 hex chars

    // 4. Set expiry (1 hour)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // 5. Create entity (stores plain token)
    const resetToken = PasswordResetToken.create(
      plainToken,
      user.id,
      expiresAt,
    );

    // 6. Save token
    await this.passwordResetTokenRepository.save(resetToken);

    // 7. Send email with plain token
    await this.emailSenderService.sendPasswordResetEmail(
      user.email,
      plainToken,
    );

    return {
      success: true,
      message: 'If an account exists, a password reset link has been sent.',
    };
  }
}
