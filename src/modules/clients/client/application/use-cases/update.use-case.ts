import { Injectable, NotFoundException } from '@nestjs/common';
import { IClientRepository } from '../../domain/interface/client.repository.interface';
import { UpdateClientDto } from '../dtos/client.dto';
import { Client } from '../../domain/entities/client.entity';

@Injectable()
export class UpdateClientUseCase {
  constructor(private readonly clientRepository: IClientRepository) {}

  async execute(id: string, dto: UpdateClientDto): Promise<Client> {
    // Find existing client
    const client = await this.clientRepository.findById(id);

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    // Update client with new data (excluding buildings)
    client.update({
      companyName: dto.companyName,
      KRAPin: dto.KRAPin,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      paymentMethod: dto.paymentMethod,
    });

    // Save updated client
    return await this.clientRepository.save(client);
  }
}
