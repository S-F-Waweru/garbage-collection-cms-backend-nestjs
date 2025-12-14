// invoice.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

// Infrastructure
import { InvoiceSchema } from './infrastructure/invoice.schema';
import { InvoiceRepository } from './infrastructure/invoice.repository';
import { InvoiceCronService } from './infrastructure/cron/invoice-cron.service';

// Use Cases
import { GenerateInvoiceUseCase } from './application/use-cases/generate-invoice.use-case';
import { GetInvoiceUseCase } from './application/use-cases/get-invoice.use-case';
import { ListInvoicesUseCase } from './application/use-cases/list-invoices.use-case';
import { UpdateInvoiceStatusUseCase } from './application/use-cases/update-invoice-status.use-case';
import { AutoGenerateInvoicesUseCase } from './application/use-cases/auto-generate-invoices.use-case';
import { MarkOverdueInvoicesUseCase } from './application/use-cases/mark-overdue-invoices.use-case';

// Presentation
import { InvoiceController } from './presentation/invoice.controller';

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
  ],
  controllers: [InvoiceController],
  exports: ['IInvoiceRepository', GenerateInvoiceUseCase],
})
export class InvoiceModule {}
