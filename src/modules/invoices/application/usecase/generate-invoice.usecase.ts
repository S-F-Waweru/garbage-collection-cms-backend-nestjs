// application/use-cases/generate-invoice.use-case.ts
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IInvoiceRepository } from '../../domain/invoice.repository.interface';
import { IClientCreditRepository } from '../../../client-credit/domain/client-credit.repository.interface';
import { IClientRepository } from '../../../client-management/domain/client.repository.interface';
import { Invoice, InvoiceStatus } from '../../domain/invoice.entity';
import { GenerateInvoiceDto } from '../dto/generate-invoice.dto';

@Injectable()
export class GenerateInvoiceUseCase {
  constructor(
    @Inject('IInvoiceRepository')
    private readonly invoiceRepo: IInvoiceRepository,
    @Inject('IClientCreditRepository')
    private readonly creditRepo: IClientCreditRepository,
    @Inject('IClientRepository')
    private readonly clientRepo: IClientRepository,
  ) {}

  async execute(dto: GenerateInvoiceDto, userId: string): Promise<Invoice> {
    // 1. Get client
    const client = await this.clientRepo.findById(dto.clientId);
    if (!client || client.isDeactivated) {
      throw new BadRequestException('Client not found or deactivated');
    }

    // 2. Check for duplicate invoice in period
    const exists = await this.invoiceRepo.existsForPeriod(
      dto.clientId,
      dto.billingPeriodStart,
      dto.billingPeriodEnd,
    );
    if (exists) {
      throw new BadRequestException('Invoice already exists for this period');
    }

    // 3. Calculate amounts
    const unitCount = client.unitCount;
    const unitPrice = client.unitPrice;
    const subtotal = unitCount * unitPrice;

    // 4. Apply client credit
    const clientCredit = await this.creditRepo.findByClientId(dto.clientId);
    const creditToApply = Math.min(clientCredit.balance, subtotal);
    const totalAmount = subtotal - creditToApply;

    // 5. Determine status
    const status =
      totalAmount === 0 ? InvoiceStatus.PAID : InvoiceStatus.PENDING;

    // 6. Get next invoice number
    const invoiceNumber = await this.invoiceRepo.getNextInvoiceNumber();

    // 7. Calculate dates
    const invoiceDate = dto.invoiceDate || new Date();
    const dueDate = this.calculateDueDate(invoiceDate);

    // 8. Create invoice
    const invoice = Invoice.create({
      invoiceNumber,
      clientId: dto.clientId,
      billingPeriodStart: dto.billingPeriodStart,
      billingPeriodEnd: dto.billingPeriodEnd,
      invoiceDate,
      dueDate,
      unitCount,
      unitPrice,
      subtotal,
      creditApplied: creditToApply,
      totalAmount,
      amountPaid: status === InvoiceStatus.PAID ? totalAmount : 0,
      balance: status === InvoiceStatus.PAID ? 0 : totalAmount,
      status,
      notes: dto.notes,
      createdBy: userId,
    });

    // 9. Save invoice
    const savedInvoice = await this.invoiceRepo.save(invoice);

    // 10. Deduct credit if applied
    if (creditToApply > 0) {
      await this.creditRepo.decrementBalance(dto.clientId, creditToApply);
    }

    return savedInvoice;
  }

  private calculateDueDate(invoiceDate: Date): Date {
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + 30);
    return dueDate;
  }
}
