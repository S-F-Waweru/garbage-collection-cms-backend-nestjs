// application/use-cases/record-payment.use-case.ts
import {
  Injectable,
  Inject,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { IClientRepository } from 'src/modules/clients/client/domain/interface/client.repository.interface';

import { DataSource } from 'typeorm';
import { Payment } from '../../domain/payment.entity';

import { RecordPaymentDto } from '../payment.dto';
import { IInvoiceRepository } from 'src/modules/invoices/domain/invoice.repository.intreface';
import { IPaymentRepository } from '../../domain/payment.repositiory.interface';
import { ICreditClientRepository } from 'src/modules/client-credit/domain/client_credit.repository.interfacace';
import { PaymentSchema } from '../../infrastructure/payment.schema';

@Injectable()
export class RecordPaymentUseCase {
  constructor(
    @Inject(IPaymentRepository)
    private readonly paymentRepo: IPaymentRepository,
    @Inject(IInvoiceRepository)
    private readonly invoiceRepo: IInvoiceRepository,
    @Inject(ICreditClientRepository)
    private readonly creditRepo: ICreditClientRepository,
    @Inject(IClientRepository)
    private readonly clientRepo: IClientRepository,
    private readonly dataSource: DataSource,
  ) {}
  logger = new Logger(RecordPaymentUseCase.name);

  async execute(dto: RecordPaymentDto, userId: string): Promise<Payment> {
    const client = await this.clientRepo.findById(dto.clientId);
    if (!client) {
      throw new BadRequestException('Client not found');
    }

    const paymentNumber = await this.paymentRepo.getNextPaymentNumber();

    const payment = Payment.create({
      paymentNumber,
      clientId: dto.clientId,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod,
      paymentDate: dto.paymentDate,
      referenceNumber: dto.referenceNumber,
      notes: dto.notes,
      createdBy: userId,
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Save payment FIRST inside transaction
      const savedPayment = await queryRunner.manager.save(PaymentSchema, {
        id: payment.id,
        paymentNumber: payment.paymentNumber,
        clientId: payment.clientId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        paymentDate: payment.paymentDate,
        referenceNumber: payment.referenceNumber,
        notes: payment.notes,
        createdBy: payment.createdBy,
        appliedToInvoices: payment.appliedToInvoices,
        excessAmount: payment.excessAmount,
      });

      // Get outstanding invoices
      const outstandingInvoices =
        await this.invoiceRepo.findOutstandingByClient(dto.clientId);
      let remainingAmount = dto.amount;

      for (const invoice of outstandingInvoices) {
        if (remainingAmount <= 0) break;

        const amountToApply = Math.min(remainingAmount, invoice.balance);
        invoice.applyPayment(amountToApply);
        await this.invoiceRepo.update(invoice.id, invoice);

        payment.addInvoiceApplication(
          invoice.id,
          invoice.invoiceNumber,
          amountToApply,
        );
        remainingAmount -= amountToApply;
      }

      if (remainingAmount > 0) {
        payment.setExcessAmount(remainingAmount);
        await this.creditRepo.incrementBalance(dto.clientId, remainingAmount);
      }

      // Update payment with invoice applications
      await queryRunner.manager.update(PaymentSchema, payment.id, {
        appliedToInvoices: payment.appliedToInvoices as any,  // Cast to any
        excessAmount: payment.excessAmount,
      });
      
      await queryRunner.commitTransaction();
      
      const finalPayment = await this.paymentRepo.findById(payment.id);
      if (!finalPayment) {
        throw new BadRequestException('Payment not found after save');
      }
      
      return finalPayment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
