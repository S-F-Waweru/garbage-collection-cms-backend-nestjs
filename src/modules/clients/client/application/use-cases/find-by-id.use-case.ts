import { Injectable, NotFoundException } from '@nestjs/common';
import { IClientRepository } from '../../domain/interface/client.repository.interface';
import { Client } from '../../domain/entities/client.entity';

@Injectable()
export class FindClientByIdUseCase {
  constructor(private readonly clientRepository: IClientRepository) {}

  async execute(id: string): Promise<Client> {
    const client = await this.clientRepository.findById(id);

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return client;
  }
}
