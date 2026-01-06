// application/use-cases/list-payments.use-case.ts
import { Injectable, Inject, Logger } from '@nestjs/common';

import { Payment } from '../../domain/payment.entity';
import { IPaymentRepository } from '../../domain/payment.repositiory.interface';
import {
  PaginatedResult,
  PaginationParams,
} from '../../../clients/client/application/use-cases/find-all-pagiantion.use-case';
import { IClientRepository } from '../../../clients/client/domain/interface/client.repository.interface';

@Injectable()
export class ListPaginatedPaymentsUseCase {
  constructor(
    @Inject(IPaymentRepository)
    private readonly paymentRepo: IPaymentRepository,
    @Inject(IClientRepository)
    private readonly clientRepository: IClientRepository,
  ) {}

  private readonly logger = new Logger(ListPaginatedPaymentsUseCase.name);
  async execute(params: PaginationParams): Promise<PaginatedResult<Payment>> {
    this.logger.debug(ListPaginatedPaymentsUseCase.name, params);
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [payments, total] = await this.paymentRepo.findAllPaginated(
      skip,
      limit,
    );

    console.log(`Gotten the payments`);
    this.logger.debug(payments);

    for (const payment of payments) {
      const client = await this.clientRepository.findById(payment.clientId);
      if (client) {
        payment.setClient(client);
      }
    }

    this.logger.debug(payments);
    return {
      data: payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
