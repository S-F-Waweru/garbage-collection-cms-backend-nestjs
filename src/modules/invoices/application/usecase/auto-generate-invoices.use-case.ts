// application/use-cases/auto-generate-invoices.use-case.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { IClientRepository } from 'src/modules/clients/client/domain/interface/client.repository.interface';
import { GenerateInvoiceDto } from '../dto/invoice.dto';
import { GenerateInvoiceUseCase } from './generate-invoice.usecase';

@Injectable()
export class AutoGenerateInvoicesUseCase {
  private readonly logger = new Logger(AutoGenerateInvoicesUseCase.name);

  constructor(
    @Inject('IClientRepository')
    private readonly clientRepo: IClientRepository,
    private readonly generateInvoiceUseCase: GenerateInvoiceUseCase,
  ) {}

  // async execute(): Promise<{ generated: number; failed: number }> {
  //   this.logger.log('Starting automatic invoice generation...');

  //   const today = new Date();
  //   const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  //   const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  //   // Get all active clients
  //   // todo tha actice Param
  //   // const activeClients = await this.clientRepo.findAllActive();
  //   const activeClients = await this.clientRepo.findAll();
  //   //

  //   let generated = 0;
  //   let failed = 0;

  //   for (const client of activeClients) {
  //     try {
  //       // Check if client's billing date is today
  //       const billingDate = client.customBillingDate || 1;
  //       if (today.getDate() === billingDate) {
  //         const dto = new GenerateInvoiceDto();
  //         dto.clientId = client.id;
  //         dto.billingPeriodStart = firstOfMonth;
  //         dto.billingPeriodEnd = lastOfMonth;
  //         dto.invoiceDate = today;

  //         await this.generateInvoiceUseCase.execute(dto, 'SYSTEM');
  //         generated++;
  //         this.logger.log(`Generated invoice for client ${client.id}`);
  //       }
  //     } catch (error) {
  //       failed++;
  //       this.logger.error(
  //         `Failed to generate invoice for client ${client.id}: ${error.message}`,
  //       );
  //     }
  //   }

  //   this.logger.log(
  //     `Invoice generation complete. Generated: ${generated}, Failed: ${failed}`,
  //   );
  //   return { generated, failed };
  // }
}
