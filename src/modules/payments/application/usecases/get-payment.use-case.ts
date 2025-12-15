// application/use-cases/get-payment.use-case.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IPaymentRepository } from '../../domain/payment.repository.interface';
import { Payment } from '../../domain/payment.entity';

@Injectable()
export class GetPaymentUseCase {
  constructor(
    @Inject('IPaymentRepository')
    private readonly paymentRepo: IPaymentRepository,
  ) {}

  async execute(id: string): Promise<Payment> {
    const payment = await this.paymentRepo.findById(id);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }
}
