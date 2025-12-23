import { Inject, Injectable } from '@nestjs/common';
import { IClientRepository } from '../../domain/interface/client.repository.interface';
import { ClientRepository } from '../../infrastructure/perisistence/repository/client.repository';

@Injectable()
export class FindAllClientsRawUseCase {
  constructor(
    @Inject(IClientRepository)
    private readonly clientRepository: IClientRepository,
  ) {}

  async excute() {
    const clients = await this.clientRepository.findAll();

    return clients;
  }
}
