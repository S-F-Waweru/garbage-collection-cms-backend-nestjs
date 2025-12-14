// application/use-cases/list-invoices.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import {
  IInvoiceRepository,
  InvoiceFilters,
} from '../../domain/invoice.repository.interface';
import { Invoice } from '../../domain/invoice.entity';

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
