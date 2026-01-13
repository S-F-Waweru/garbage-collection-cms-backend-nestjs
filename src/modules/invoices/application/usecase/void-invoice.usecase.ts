import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IInvoiceRepository } from '../../domain/invoice.repository.intreface';
import { ICreditClientRepository } from '../../../client-credit/domain/client_credit.repository.interfacace';
import { InvoiceStatus } from '../models';

@Injectable()
export class VoidInvoiceUseCase {
  constructor(
    @Inject(IInvoiceRepository)
    private readonly invoiceRepository: IInvoiceRepository,
    @Inject(ICreditClientRepository)
    private readonly creditRepository: ICreditClientRepository,
  ) {}

  async execute(invoiceId: string): Promise<void> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) throw new NotFoundException('Invoice not found');

    if (invoice.amountPaid > 0) {
      throw new BadRequestException('Cannot void invoice with payments');
    }

    // Restore credit
    if (invoice.creditApplied > 0) {
      const clientCredit = await this.creditRepository.findByClientId(
        invoice.clientId,
      );
      if (!clientCredit) throw new NotFoundException('Client credit not found');
      clientCredit.incrementBalance(invoice.creditApplied);
      await this.creditRepository.save(clientCredit);
    }
    invoice.setStatus(InvoiceStatus.CANCELLED);
    await this.invoiceRepository.save(invoice);
  }
}
