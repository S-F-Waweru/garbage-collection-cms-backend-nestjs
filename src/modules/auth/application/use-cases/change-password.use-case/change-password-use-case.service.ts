import { Inject, Injectable } from '@nestjs/common';
import { IAuthRepository } from '../../../domain/interfaces/auth.repository.interface';
import { ChangePasswordDto } from '../../dto/auth.request.dto';
import {
  PasswordHasherService,
} from '../../services/password-hasher-service/password-hasher-service.service';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(IAuthRepository)
    private readonly authRepository: IAuthRepository,
    private readonly passwordHasher: PasswordHasherService,
  ) {}

  async execute(dto: ChangePasswordDto) {
    const newPassword = dto.newPassword;
    const currentPassword = dto.currentPassword;
    const userId = dto.userId;

    const user = await this.authRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const isValid = await this.validatePassword(
      currentPassword,
      user.password.value,
    );

    if (!isValid) {
      throw new Error('Invalid current password');
    }
    const newHashedPassword = await this.passwordHasher.hash(newPassword);

    user.changePassword(newHashedPassword);

    await this.authRepository.update(user);

    return {
      statusCode: 200,
      message: 'Password changed successfully',
    };
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    if (!password) throw new Error('Password cannot be empty');
    const isValid = await this.passwordHasher.compare(password, hashedPassword);
    if (!isValid) throw new Error('Invalid password');
    return true;
  }
}
