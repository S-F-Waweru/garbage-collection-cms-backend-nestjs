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
import { GetExpenseIncomeChartUseCase } from './application/usecase/get-expense-income-chart.usecase';
import { IncomeRecordSchema } from '../other-income/income-record/infrastructure/schema/income-record.schema';
import { ExpenseSchema } from '../expences/expence/infrastructure/expense.schema';
import { IncomeCategorySchema } from '../other-income/income-category/infrastructure/schema/IncomeCategory.schema';
import { IncomeRecordRepository } from '../other-income/income-record/infrastructure/schema/repository/income-record.repository';
import { ExpenseRepository } from '../expences/expence/infrastructure/expense.repository';
import { GetPaymentReportUseCase } from './application/usecase/get-payment-report.use-case';
import { PaymentExcelReport } from './application/usecase/getpaymentpreport-to-excel.usecase';
import { IReportRepository } from './domain/report.repository.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InvoiceSchema,
      PaymentSchema,
      IncomeRecordSchema,
      IncomeCategorySchema, // Add this - IncomeRecordRepository needs it
      ExpenseSchema,
      // Add other schemas
    ]),
  ],
  providers: [
    // Repository
    {
      provide: IReportRepository,
      useClass: ReportRepository,
    },
    IncomeRecordRepository, // Add this
    ExpenseRepository, // Add this

    // Use Cases
    GetOutstandingBalancesUseCase,
    GetRevenueReportUseCase,
    GetPettyCashReportUseCase,
    GetOtherIncomeReportUseCase,
    GetSummaryStatisticsUseCase,
    GetExpenseIncomeChartUseCase,
    ExportReportToExcelUseCase,
    GetPaymentReportUseCase,
    PaymentExcelReport,
  ],
  controllers: [ReportController],
  exports: [IReportRepository],
})
export class ReportModule {}
