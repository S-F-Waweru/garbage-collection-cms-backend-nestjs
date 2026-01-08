// invoice.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { GenerateInvoiceUseCase } from './application/usecase/generate-invoice.usecase';
import { GetInvoiceUseCase } from './application/usecase/get-invoice.use-case';
import { ListInvoicesUseCase } from './application/usecase/list-invoices.use-case';
import { MarkOverdueInvoicesUseCase } from './application/usecase/mark-overdue-invoices.use-case';
import { UpdateInvoiceStatusUseCase } from './application/usecase/update-invoice-status.use-case';
import { InvoiceRepository } from './infrasctructure/invoice.repository';
import { InvoiceSchema } from './infrasctructure/invoice.rschema';
import { InvoiceController } from './presentaion/invoice.controller';
import { InvoiceCronService } from './application/services/invoice-cron/invoice-cron.service';
import { ClientModule } from '../clients/client/client.module';
import { IInvoiceRepository } from './domain/invoice.repository.intreface';
import { ClientCreditModule } from '../client-credit/client-credit.module';
import { GetAllInvoicesPaginatedUseCase } from './application/usecase/get-all-invoices-paginate';
import { BulkDownloadInvoicesUseCase } from './application/usecase/bulk-download-invoices.use-case';
import { DownloadInvoicePdfUseCase } from './application/usecase/download-invoice-pdf.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvoiceSchema]),
    ScheduleModule.forRoot(),
    ClientModule,
    ClientCreditModule,
  ],
  providers: [
    {
      provide: IInvoiceRepository,
      useClass: InvoiceRepository,
    },
    GenerateInvoiceUseCase,
    GetInvoiceUseCase,
    ListInvoicesUseCase,
    UpdateInvoiceStatusUseCase,
    MarkOverdueInvoicesUseCase,
    InvoiceCronService,
    GetAllInvoicesPaginatedUseCase,
    BulkDownloadInvoicesUseCase,
    DownloadInvoicePdfUseCase,
  ],
  controllers: [InvoiceController],
  exports: [IInvoiceRepository, GenerateInvoiceUseCase], // ✅ Fixed: token reference
})
export class InvoiceModule {}
