// application/use-cases/record-payment.use-case.ts
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IClientRepository } from 'src/modules/clients/client/domain/interface/client.repository.interface';

import { DataSource } from 'typeorm';
import { Payment } from '../../domain/payment.entity';

import { RecordPaymentDto } from '../payment.dto';
import { IInvoiceRepository } from 'src/modules/invoices/domain/invoice.repository.intreface';
import { IPaymentRepository } from '../../domain/payment.repositiory.interface';
import { ICreditClientRepository } from 'src/modules/client-credit/domain/client_credit.repository.interfacace';

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

  async execute(dto: RecordPaymentDto, userId: string): Promise<Payment> {
    // 1. Validate client exists
    const client = await this.clientRepo.findById(dto.clientId);
    if (!client) {
      throw new BadRequestException('Client not found');
    }

    // 2. Get next payment number
    const paymentNumber = await this.paymentRepo.getNextPaymentNumber();

    // 3. Create payment entity
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

    // 4. Apply payment to invoices in a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get outstanding invoices (oldest first - FIFO)
      const outstandingInvoices =
        await this.invoiceRepo.findOutstandingByClient(dto.clientId);

      let remainingAmount = dto.amount;

      // Apply to invoices
      for (const invoice of outstandingInvoices) {
        if (remainingAmount <= 0) break;

        const amountToApply = Math.min(remainingAmount, invoice.balance);

        // Update invoice
        invoice.applyPayment(amountToApply);
        await this.invoiceRepo.update(invoice.id, invoice);

        // Track application in payment
        payment.addInvoiceApplication(
          invoice.id,
          invoice.invoiceNumber,
          amountToApply,
        );

        remainingAmount -= amountToApply;
      }

      // If there's excess, add to client credit
      if (remainingAmount > 0) {
        payment.setExcessAmount(remainingAmount);
        await this.creditRepo.incrementBalance(dto.clientId, remainingAmount);
      }

      // Save payment
      const savedPayment = await this.paymentRepo.save(payment);

      await queryRunner.commitTransaction();
      return savedPayment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
