// infrastructure/cron/invoice-cron.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AutoGenerateInvoicesUseCase } from '../../application/usecase/auto-generate-invoices.use-case';
import { MarkOverdueInvoicesUseCase } from '../../application/usecase/mark-overdue-invoices.use-case';

@Injectable()
export class InvoiceCronService {
  private readonly logger = new Logger(InvoiceCronService.name);

  constructor(
    private readonly autoGenerateUseCase: AutoGenerateInvoicesUseCase,
    private readonly markOverdueUseCase: MarkOverdueInvoicesUseCase,
  ) {}

  //  todo change to the first day or  the decralered  date
  // Run daily at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyInvoiceGeneration() {
    // this.logger.log('Running daily invoice generation cron job');
    // try {
    //   const result = await this.autoGenerateUseCase.execute();
    //   this.logger.log(`Cron job completed: ${JSON.stringify(result)}`);
    // } catch (error) {
    //   this.logger.error(`Cron job failed: ${error.message}`, error.stack);
    // }
  }

  // Run daily at 1 AM to mark overdue invoices
  @Cron('0 1 * * *')
  async handleMarkOverdueInvoices() {
    this.logger.log('Running mark overdue invoices cron job');

    try {
      const count = await this.markOverdueUseCase.execute();
      this.logger.log(`Marked ${count} invoices as overdue`);
    } catch (error) {
      this.logger.error(
        `Failed to mark overdue invoices: ${error.message}`,
        error.stack,
      );
    }
  }
}
