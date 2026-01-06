import { Inject, Injectable } from '@nestjs/common';
import { IAuthRepository } from '../../domain/interfaces/auth.repository.interface';
import AuthRepository from '../../infrastructure/persistence/repository/auth.repository';
import { PaginationParams } from 'src/modules/clients/client/application/use-cases/find-all-pagiantion.use-case';

@Injectable()
export class ViewPaginatedUsersUsecase {
  constructor(
    @Inject(IAuthRepository)
    private readonly authRepo: AuthRepository,
  ) {}

  async execute(params: PaginationParams = { page: 1, limit: 10 }) {
    const page = Math.max(1, params.page);
    const limit = Math.max(1, params.limit);
    const skip = (page - 1) * limit;
    const [users, total] = await this.authRepo.getPaginatedUsers(skip, limit);

    // Remove password from each user
    const sanitizedUsers = users.map((user) => {
      const { _password, _email, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        _email: _email.value,
      };
    });

    return {
      data: sanitizedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
