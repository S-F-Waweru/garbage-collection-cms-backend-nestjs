import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IInvoiceRepository } from '../../../domain/invoice.repository.intreface';
import { GenerateInvoiceUseCase } from '../../usecase/generate-invoice.usecase';
import { IClientRepository } from '../../../../clients/client/domain/interface/client.repository.interface';

@Injectable()
export class InvoiceCronService {
  private readonly logger = new Logger(InvoiceCronService.name);

  constructor(
    @Inject(IInvoiceRepository)
    private readonly invoiceRepository: IInvoiceRepository,
    @Inject(IClientRepository) // Fixed DI syntax
    private readonly clientRepository: IClientRepository, // Fixed property name
    private readonly generateInvoiceUseCase: GenerateInvoiceUseCase, // Direct injection
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleMonthlyInvoiceGeneration() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    let generated = 0;
    let failed = 0;

    try {
      // 1. Get all active clients
      const clients = await this.clientRepository.findAll();

      // 2. Generate for each client
      for (const client of clients) {
        try {
          // Check if client's billing date is today
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
}
