import { Injectable, Inject } from '@nestjs/common';
import { ICreditClientRepository } from '../../domain/client_credit.repository.interfacace';
import {
  IncrementBalanceDto,
  ClientCreditResponseDto,
} from '../dto/client-credit.dto';

@Injectable()
export class IncrementBalanceUseCase {
  constructor(
    @Inject(ICreditClientRepository)
    private readonly creditRepository: ICreditClientRepository,
  ) {}

  async execute(dto: IncrementBalanceDto): Promise<ClientCreditResponseDto> {
    const credit = await this.creditRepository.incrementBalance(
      dto.clientId,
      dto.amount,
    );
    return ClientCreditResponseDto.fromDomain(credit);
  }
}
