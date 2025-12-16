import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IClientRepository } from 'src/modules/clients/client/domain/interface/client.repository.interface';
import { ClientCredit } from '../../domain/client-credit.entity';
import { ICreditClientRepository } from '../../domain/client_credit.repository.interfacace';
import {
  CreateClientCreditDto,
  ClientCreditResponseDto,
} from '../dto/client-credit.dto';

@Injectable()
export class CreateClientCreditUseCase {
  constructor(
    @Inject(ICreditClientRepository)
    private readonly creditRepository: ICreditClientRepository,
    @Inject(IClientRepository)
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(dto: CreateClientCreditDto): Promise<ClientCreditResponseDto> {
    // Check if client exists
    const client = await this.clientRepository.findById(dto.clientId);
    if (!client) {
      throw new NotFoundException(`Client with ID ${dto.clientId} not found`);
    }

    // Check if credit already exists
    const existingCredit = await this.creditRepository.findByClientId(
      dto.clientId,
    );
    if (existingCredit) {
      throw new BadRequestException(
        `Client credit already exists for client ${dto.clientId}`,
      );
    }

    // Create new credit
    const credit = ClientCredit.create({
      client,
      balance: dto.balance || 0,
    });

    const saved = await this.creditRepository.save(credit);
    return ClientCreditResponseDto.fromDomain(saved);
  }
}
