import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ICreditClientRepository } from '../../domain/client_credit.repository.interfacace';

@Injectable()
export class GetCreditByClientIdUseCase {
  constructor(
    @Inject(ICreditClientRepository)
    private readonly clientCreditRepo: ICreditClientRepository,
  ) {}
  private logger = new Logger(GetCreditByClientIdUseCase.name);

  async execute(id: string) {
    const credit = await this.clientCreditRepo.findByClientId(id);
    if (!credit) {
      throw new NotFoundException('Client id not found');
    }

    this.logger.debug('CRediitt DATAA');
    this.logger.debug(credit);
    return credit;
  }
}
