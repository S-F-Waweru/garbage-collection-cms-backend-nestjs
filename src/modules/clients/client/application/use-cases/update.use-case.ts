import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IClientRepository } from '../../domain/interface/client.repository.interface';
import { UpdateClientDto } from '../dtos/client.dto';
import { Client } from '../../domain/entities/client.entity';

@Injectable()
export class UpdateClientUseCase {
  constructor(
    @Inject(IClientRepository)
    private readonly clientRepository: IClientRepository,
  ) {}

  logger = new Logger(UpdateClientUseCase.name);
  async execute(id: string, dto: UpdateClientDto): Promise<Client> {
    // Find existing client
    const client = await this.clientRepository.findById(id);

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    const billingDate = Number(dto.billingDate);
    // Update client with new data (excluding buildings)
    client.update({
      companyName: dto.companyName,
      KRAPin: dto.KRAPin,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      billingDate,
      paymentMethod: dto.paymentMethod,
    });

    this.logger.debug(client);
    // Save updated client
    return await this.clientRepository.save(client);
  }
}
