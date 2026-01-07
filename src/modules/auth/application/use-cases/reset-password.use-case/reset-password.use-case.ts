import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message:
      'Password must contain uppercase, lowercase, number, and special character',
  })
  newPassword: string;
}

import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IPasswordResetTokenRepository } from 'src/modules/auth/domain/interfaces/password.reposiory.interface';
import { Password } from 'src/modules/auth/domain/value-objects/Password.vo';
import { PasswordHasherService } from '../../services/password-hasher-service/password-hasher-service.service';
import { IAuthRepository } from 'src/modules/auth/domain/interfaces/auth.repository.interface';

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
