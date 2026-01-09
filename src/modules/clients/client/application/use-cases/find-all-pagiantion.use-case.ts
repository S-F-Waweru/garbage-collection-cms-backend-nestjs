import { Inject, Injectable } from '@nestjs/common';
import { IClientRepository } from '../../domain/interface/client.repository.interface';
import { Client } from '../../domain/entities/client.entity';

export interface PaginationParams {
  page: number;
  limit: number;
  searchTerm?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class FindAllClientsUseCase {
  constructor(
    @Inject(IClientRepository)
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(params: PaginationParams): Promise<PaginatedResult<Client>> {
    const { page, limit, searchTerm } = params;
    const skip = (page - 1) * limit;

    // Pass searchTerm to the repository
    const [clients, total] = await this.clientRepository.findAllPaginated(
      skip,
      limit,
      searchTerm,
    );

    return {
      data: clients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
