// application/use-cases/list-invoices.use-case.ts
import { Injectable, Inject } from '@nestjs/common';

import { Invoice } from '../../domain/invoice.entity';
import type {
  IInvoiceRepository,
  InvoiceFilters,
} from '../../domain/invoice.repository.intreface';

@Injectable()
export class ListInvoicesUseCase {
  constructor(
    @Inject('IInvoiceRepository')
    private readonly invoiceRepo: IInvoiceRepository,
  ) {}

  async execute(filters?: InvoiceFilters): Promise<Invoice[]> {
    return this.invoiceRepo.findAll(filters);
  }
}
