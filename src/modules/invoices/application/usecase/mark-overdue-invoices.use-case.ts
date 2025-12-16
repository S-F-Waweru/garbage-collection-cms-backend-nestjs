// application/use-cases/mark-overdue-invoices.use-case.ts
import { Injectable, Inject, Logger } from '@nestjs/common';

import { InvoiceStatus } from '../../domain/invoice.entity';
import { IInvoiceRepository } from '../../domain/invoice.repository.intreface';

@Injectable()
export class MarkOverdueInvoicesUseCase {
  private readonly logger = new Logger(MarkOverdueInvoicesUseCase.name);

  constructor(
    @Inject(IInvoiceRepository)
    private readonly invoiceRepo: IInvoiceRepository,
  ) {}

  async execute(): Promise<number> {
    this.logger.log('Checking for overdue invoices...');

    const invoices = await this.invoiceRepo.findAll({
      status: InvoiceStatus.PENDING,
    });

    let marked = 0;

    for (const invoice of invoices) {
      if (invoice.isOverdue()) {
        try {
          invoice.markAsOverdue();
          await this.invoiceRepo.update(invoice.id, invoice);
          marked++;
        } catch (error) {
          this.logger.error(
            `Failed to mark invoice ${invoice.id} as overdue: ${error.message}`,
          );
        }
      }
    }

    this.logger.log(`Marked ${marked} invoices as overdue`);
    return marked;
  }
}
