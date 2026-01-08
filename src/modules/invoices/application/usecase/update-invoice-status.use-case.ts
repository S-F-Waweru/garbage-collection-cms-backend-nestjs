// application/use-cases/update-invoice-status.use-case.ts
import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { Invoice } from '../../domain/invoice.entity';
import { IInvoiceRepository } from '../../domain/invoice.repository.intreface';
import { InvoiceStatus } from '../models';

@Injectable()
export class UpdateInvoiceStatusUseCase {
  constructor(
    @Inject(IInvoiceRepository)
    private readonly invoiceRepo: IInvoiceRepository,
  ) {}

  async execute(id: string, newStatus: InvoiceStatus): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findById(id);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (!invoice.canTransitionTo(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${invoice.status} to ${newStatus}`,
      );
    }

    invoice.updateStatus(newStatus);
    const updatedInvoice = await this.invoiceRepo.update(id, invoice);

    if (!updatedInvoice) {
      throw new NotFoundException('Error Updating');
    }

    return updatedInvoice;
  }
}
