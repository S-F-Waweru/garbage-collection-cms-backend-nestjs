// application/use-cases/list-payments.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import {
  IPaymentRepository,
  PaymentFilters,
} from '../../domain/payment.repository.interface';
import { Payment } from '../../domain/payment.entity';

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
