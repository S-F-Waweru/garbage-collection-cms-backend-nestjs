import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IInvoiceRepository } from '../../../domain/invoice.repository.intreface';
import { GenerateInvoiceUseCase } from '../../usecase/generate-invoice.usecase';
import { IClientRepository } from '../../../../clients/client/domain/interface/client.repository.interface';
import { VoidInvoiceUseCase } from '../../usecase/void-invoice.usecase';

@Injectable()
export class InvoiceCronService {
  private readonly logger = new Logger(InvoiceCronService.name);

  constructor(
    @Inject(IInvoiceRepository)
    private readonly invoiceRepository: IInvoiceRepository,
    @Inject(IClientRepository)
    private readonly clientRepository: IClientRepository,
    private readonly generateInvoiceUseCase: GenerateInvoiceUseCase,
    private readonly voidInvoiceUseCase: VoidInvoiceUseCase,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleMonthlyInvoiceGeneration() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    let generated = 0;
    let failed = 0;

    try {
      const clients = await this.clientRepository.findAll();

      for (const client of clients) {
        try {
          if (client.billingDate === today.getDate()) {
            await this.generateInvoiceUseCase.execute(
              {
                clientId: client.id,
                billingPeriodStart: firstDay,
                billingPeriodEnd: lastDay,
                invoiceDate: today,
              },
              'SYSTEM',
            );
            generated++;
          }
        } catch (error: any) {
          this.logger.error(`Failed for client ${client.id}: ${error.message}`);
          failed++;
        }
      }
    } catch (error: any) {
      this.logger.error(`Monthly invoice generation failed: ${error.message}`);
    }

    this.logger.log(`Generated ${generated} invoices, ${failed} failed`);
  }

  async fixWrongInvoice(wrongInvoiceId: string, userId: string) {
    const oldInvoice = await this.invoiceRepository.findById(wrongInvoiceId);

    if (!oldInvoice) return new NotFoundException(`Invoice not found`);
    // Cancel and restore credit
    await this.voidInvoiceUseCase.execute(wrongInvoiceId);

    // Generate new correct invoice
    return await this.generateInvoiceUseCase.execute(
      {
        clientId: oldInvoice.clientId,
        billingPeriodStart: oldInvoice.billingPeriodStart,
        billingPeriodEnd: oldInvoice.billingPeriodEnd,
        invoiceDate: new Date(),
      },
      userId,
    );
  }
}
