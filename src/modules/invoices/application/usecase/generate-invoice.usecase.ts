// use-cases/generate-invoice.usecase.ts
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IClientRepository } from '../../../clients/client/domain/interface/client.repository.interface';
import { ICreditClientRepository } from '../../../client-credit/domain/client_credit.repository.interfacace';
import { IInvoiceRepository } from '../../domain/invoice.repository.intreface';
import { GenerateInvoiceDto } from '../dto/invoice.dto';
import { Invoice, InvoiceStatus } from '../../domain/invoice.entity';

@Injectable()
export class GenerateInvoiceUseCase {
  constructor(
    @Inject(IClientRepository)
    private readonly clientRepository: IClientRepository,
    @Inject(ICreditClientRepository)
    private readonly creditRepository: ICreditClientRepository,
    @Inject(IInvoiceRepository)
    private readonly invoiceRepository: IInvoiceRepository,
  ) {}

  // generate-invoice.use-case.ts

  async execute(dto: GenerateInvoiceDto, userId: string): Promise<Invoice> {
    // 1. Get client with buildings
    const client = await this.clientRepository.findById(dto.clientId);
    if (!client) throw new NotFoundException('Client not found');

    // 2. Check if invoice already exists for this period
    const exists = await this.invoiceRepository.existsForPeriod(
      dto.clientId,
      dto.billingPeriodStart,
      dto.billingPeriodEnd,
    );
    if (exists) throw new BadRequestException('Invoice already exists');

    // 3. Calculate from buildings (snapshot current state)
    let totalUnits = 0;
    let totalAmount = 0;

    for (const building of client.buildings) {
      totalUnits += building.unitCount;
      totalAmount += building.unitCount * building.unitPrice;
    }

    const subtotal = totalAmount;

    // 4. Apply client credit (KEY LOGIC)
    const clientCredit = await this.creditRepository.findByClientId(
      dto.clientId,
    );
    if (!clientCredit) throw new BadRequestException('No client credit found');

    const creditToApply = Math.min(clientCredit.balance, subtotal);

    const totalAfterCredit = subtotal - creditToApply;

    // 5. Get next invoice number
    const invoiceNumber = await this.invoiceRepository.getNextInvoiceNumber();

    // 6. Calculate due date (30 days default)
    const dueDate = dto.invoiceDate ? new Date(dto.invoiceDate) : new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // 7. Determine initial status
    const status =
      totalAfterCredit === 0 ? InvoiceStatus.PAID : InvoiceStatus.PENDING;

    // 8. Create invoice entity
    const invoice = Invoice.create({
      invoiceNumber,
      clientId: dto.clientId,
      billingPeriodStart: dto.billingPeriodStart,
      billingPeriodEnd: dto.billingPeriodEnd,
      invoiceDate: dto.invoiceDate || new Date(),
      dueDate,
      unitCount: totalUnits,
      unitPrice: totalAmount / totalUnits, // Average
      subtotal,
      creditApplied: creditToApply,
      totalAmount: totalAfterCredit,
      amountPaid: 0,
      balance: totalAfterCredit,
      status,
      notes: dto.notes,
      createdBy: userId,
    });

    // 9. Save in transaction

    return await this.invoiceRepository.save(invoice);
  }
}
