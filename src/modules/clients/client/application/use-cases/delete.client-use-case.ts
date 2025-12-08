import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IClientRepository } from '../../domain/interface/client.repository.interface';

@Injectable()
export class DeleteClientUseCase {
  constructor(
    @Inject(IClientRepository)
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(id: string): Promise<{ message: string }> {
    // Check if client exists
    const client = await this.clientRepository.findById(id);

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    // Soft delete
    await this.clientRepository.delete(id);

    return {
      message: `Client with ID ${id} deleted successfully`,
    };
  }
}
