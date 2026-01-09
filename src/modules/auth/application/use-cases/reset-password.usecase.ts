import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { IAuthRepository } from '../../domain/interfaces/auth.repository.interface';
import { IPasswordResetTokenRepository } from '../../domain/interfaces/password.reposiory.interface';
import { PasswordHasherService } from '../services/password-hasher-service/password-hasher-service.service';
import { Password } from '../../domain/value-objects/Password.vo';

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(IAuthRepository)
    private readonly userRepository: IAuthRepository,
    @Inject(IPasswordResetTokenRepository)
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    private readonly passwordHasherService: PasswordHasherService,
  ) {}

  async execute(input: ResetPasswordInput): Promise<{
    success: boolean;
    message: string;
  }> {
    const { token, newPassword } = input;

    // 1. Find the reset token
    const tokenEntity =
      await this.passwordResetTokenRepository.findByToken(token);

    if (!tokenEntity) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // 2. Validate token (expired or used)
    if (!tokenEntity.isValid()) {
      throw new BadRequestException('Token expired or already used');
    }

    // 3. Find the user
    const user = await this.userRepository.findById(tokenEntity.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 4. Validate new password (Password VO does this)
    const passwordVO = new Password(newPassword);

    // 5. Hash the new password
    const hashedPassword = await this.passwordHasherService.hash(
      passwordVO.value,
    );

    // 6. Update user password
    user.changePassword(hashedPassword);
    await this.userRepository.update(user);

    // 7. Mark token as used
    tokenEntity.markAsUsed();
    await this.passwordResetTokenRepository.update(tokenEntity);

    // 8. Optional: Delete all other reset tokens for this user
    await this.passwordResetTokenRepository.deleteByUserId(user.id);

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }
}
