// report.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Presentation
import { ReportController } from './presentation/report.controller';
import { InvoiceSchema } from '../invoices/infrasctructure/invoice.rschema';
import { ExportReportToExcelUseCase } from './application/usecase/export-report-to-excel.use-case';
import { GetOtherIncomeReportUseCase } from './application/usecase/get-other-income-report.use-case';
import { GetOutstandingBalancesUseCase } from './application/usecase/get-outstanding-balances.use-case';
import { GetPettyCashReportUseCase } from './application/usecase/get-petty-cash-report.use-case';
import { GetRevenueReportUseCase } from './application/usecase/get-revenue-report.use-case';
import { GetSummaryStatisticsUseCase } from './application/usecase/get-summary-statistics.use-case';
import { PaymentSchema } from '../payments/infrastructure/payment.schema';
import { ReportRepository } from './infrastructure/report.repository';

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
