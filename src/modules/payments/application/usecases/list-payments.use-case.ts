// application/use-cases/list-payments.use-case.ts
import { Injectable, Inject } from '@nestjs/common';

import { Payment } from '../../domain/payment.entity';
import type {
  IPaymentRepository,
  PaymentFilters,
} from '../../domain/payment.repositiory.interface';

@Injectable()
export class ListPaymentsUseCase {
  constructor(
    @Inject('IPaymentRepository')
    private readonly paymentRepo: IPaymentRepository,
  ) {}

  async execute(filters?: PaymentFilters): Promise<Payment[]> {
    return this.paymentRepo.findAll(filters);
  }
}
