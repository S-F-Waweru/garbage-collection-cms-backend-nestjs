// application/use-cases/list-payments.use-case.ts
import { Injectable, Inject } from '@nestjs/common';

import { Payment } from '../../domain/payment.entity';
import { IPaymentRepository } from '../../domain/payment.repositiory.interface';
import {
  PaginatedResult,
  PaginationParams,
} from '../../../clients/client/application/use-cases/find-all-pagiantion.use-case';

@Injectable()
export class ListPaginatedPaymentsUseCase {
  constructor(
    @Inject(IPaymentRepository)
    private readonly paymentRepo: IPaymentRepository,
  ) {}

  async execute(params: PaginationParams): Promise<PaginatedResult<Payment>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [payments, total] = await this.paymentRepo.findAllPaginated(
      skip,
      limit,
    );

    return {
      data: payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
