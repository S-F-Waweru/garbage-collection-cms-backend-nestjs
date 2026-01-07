// Fixed UpdateRoleUsecase
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IAuthRepository } from '../../domain/interfaces/auth.repository.interface';
import AuthRepository from '../../infrastructure/persistence/repository/auth.repository';
import { Role } from '../../policies/rbac.policy';
import { ChangeRoleDTO } from '../dto/auth.request.dto';

@Injectable()
export class UpdateRoleUsecase {
  constructor(
    @Inject(IAuthRepository)
    private readonly authRepository: AuthRepository,
  ) {}

  async execute(loggedUserId: string, dto: ChangeRoleDTO) {
    const { userId, role } = dto;

    // Find both users
    let exist = await this.authRepository.findById(userId);
    const loggedInUser = await this.authRepository.findById(loggedUserId);

    // Check if logged-in user exists
    if (!loggedInUser) {
      throw new NotFoundException('Logged-in user not found');
    }

    // Check if target user exists
    if (!exist) {
      throw new NotFoundException('User not found');
    }

    // Check if logged-in user has permission to change roles
    if (loggedInUser.role === Role.ACCOUNTANT) {
      throw new BadRequestException(
        'Only Admins and Directors can change the role',
      );
    }

    // Update the role
    exist.setRole(role);
    await this.authRepository.save(exist);

    return {
      message: 'Role changed successfully',
    };
  }
}
