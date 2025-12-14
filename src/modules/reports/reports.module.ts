// report.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Infrastructure
import { ReportRepository } from './infrastructure/report.repository';
import { InvoiceSchema } from '../invoices/infrastructure/invoice.schema';
import { PaymentSchema } from '../payments/infrastructure/payment.schema';
// Import other schemas as needed

// Use Cases
import { GetOutstandingBalancesUseCase } from './application/use-cases/get-outstanding-balances.use-case';
import { GetRevenueReportUseCase } from './application/use-cases/get-revenue-report.use-case';
import { GetPettyCashReportUseCase } from './application/use-cases/get-petty-cash-report.use-case';
import { GetOtherIncomeReportUseCase } from './application/use-cases/get-other-income-report.use-case';
import { GetSummaryStatisticsUseCase } from './application/use-cases/get-summary-statistics.use-case';
import { ExportReportToExcelUseCase } from './application/use-cases/export-report-to-excel.use-case';

// Presentation
import { ReportController } from './presentation/report.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InvoiceSchema,
      PaymentSchema,
      // Add other schemas
    ]),
  ],
  providers: [
    // Repository
    {
      provide: 'IReportRepository',
      useClass: ReportRepository,
    },

    // Use Cases
    GetOutstandingBalancesUseCase,
    GetRevenueReportUseCase,
    GetPettyCashReportUseCase,
    GetOtherIncomeReportUseCase,
    GetSummaryStatisticsUseCase,
    ExportReportToExcelUseCase,
  ],
  controllers: [ReportController],
  exports: ['IReportRepository'],
})
export class ReportModule {}
