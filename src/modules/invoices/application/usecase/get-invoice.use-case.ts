// application/use-cases/get-invoice.use-case.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';

import { Invoice } from '../../domain/invoice.entity';
import { IInvoiceRepository } from '../../domain/invoice.repository.intreface';

@Injectable()
export class GetInvoiceUseCase {
  constructor(
    @Inject(IInvoiceRepository)
    private readonly invoiceRepo: IInvoiceRepository,
  ) {}

  async execute(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findById(id);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }
}
