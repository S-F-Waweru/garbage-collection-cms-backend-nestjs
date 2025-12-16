// invoice.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AutoGenerateInvoicesUseCase } from './application/usecase/auto-generate-invoices.use-case';
import { GenerateInvoiceUseCase } from './application/usecase/generate-invoice.usecase';
import { GetInvoiceUseCase } from './application/usecase/get-invoice.use-case';
import { ListInvoicesUseCase } from './application/usecase/list-invoices.use-case';
import { MarkOverdueInvoicesUseCase } from './application/usecase/mark-overdue-invoices.use-case';
import { UpdateInvoiceStatusUseCase } from './application/usecase/update-invoice-status.use-case';
import { InvoiceCronService } from './infrasctructure/cron/invoice-cron.service';
import { InvoiceRepository } from './infrasctructure/invoice.repository';
import { InvoiceSchema } from './infrasctructure/invoice.rschema';
import { InvoiceController } from './presentaion/invoice.controller';
import { InvoiceCromService } from './application/services/invoice-crom/invoice-crom.service';
import { InvoiceCronService } from './application/services/invoice-cron/invoice-cron.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvoiceSchema]),
    ScheduleModule.forRoot(), // Enable cron jobs
  ],
  providers: [
    // Repository
    {
      provide: 'IInvoiceRepository',
      useClass: InvoiceRepository,
    },

    // Use Cases
    GenerateInvoiceUseCase,
    GetInvoiceUseCase,
    ListInvoicesUseCase,
    UpdateInvoiceStatusUseCase,
    AutoGenerateInvoicesUseCase,
    MarkOverdueInvoicesUseCase,

    // Cron Service
    InvoiceCronService,

    InvoiceCromService,
  ],
  controllers: [InvoiceController],
  exports: ['IInvoiceRepository', GenerateInvoiceUseCase],
})
export class InvoiceModule {}
