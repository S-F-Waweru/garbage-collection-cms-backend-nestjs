// presentation/report.controller.ts
import { Controller, Get, Query, Res, HttpStatus, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiProduces,
} from '@nestjs/swagger';
import type { Response } from 'express';
import {
  OutstandingBalanceReportDto,
  ReportFiltersDto,
  RevenueByClientReportDto,
  RevenueGroupBy,
  RevenueReportFiltersDto,
  PettyCashReportDto,
  OtherIncomeReportDto,
  SummaryStatisticsReportDto,
} from '../application/reports.dto';
import { ExportReportToExcelUseCase } from '../application/usecase/export-report-to-excel.use-case';
import { GetOtherIncomeReportUseCase } from '../application/usecase/get-other-income-report.use-case';
import { GetOutstandingBalancesUseCase } from '../application/usecase/get-outstanding-balances.use-case';
import { GetPettyCashReportUseCase } from '../application/usecase/get-petty-cash-report.use-case';
import { GetRevenueReportUseCase } from '../application/usecase/get-revenue-report.use-case';
import { GetSummaryStatisticsUseCase } from '../application/usecase/get-summary-statistics.use-case';
import { ReportType } from '../domain/report-result.entity';
import { GetExpenseIncomeChartUseCase } from '../application/usecase/get-expense-income-chart.usecase';
import { GetPaymentUseCase } from 'src/modules/payments/application/usecases/get-payment.use-case';
import { PaymentExcelReport } from '../application/usecase/getpaymentpreport-to-excel.usecase';
import { GetPaymentReportUseCase } from '../application/usecase/get-payment-report.use-case';
import { Public } from 'src/modules/auth/presentation/decorators/public.decorator';
import { GetInvoiceReportUseCase } from '../application/usecase/get-invoice-report.use-case';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportController {
  constructor(
    private readonly getOutstandingBalancesUseCase: GetOutstandingBalancesUseCase,
    private readonly getRevenueReportUseCase: GetRevenueReportUseCase,
    private readonly getPettyCashReportUseCase: GetPettyCashReportUseCase,
    private readonly getOtherIncomeReportUseCase: GetOtherIncomeReportUseCase,
    private readonly getSummaryStatisticsUseCase: GetSummaryStatisticsUseCase,
    private readonly exportReportToExcelUseCase: ExportReportToExcelUseCase,
    private readonly getExpenseIncomeChartUseCase: GetExpenseIncomeChartUseCase,
    private readonly getPaymentReportUseCase: GetPaymentReportUseCase,
    private readonly getInvoiceReportUsecase: GetInvoiceReportUseCase,
  ) {}

  @Get('outstanding-balances')
  @ApiOperation({
    summary: 'Get outstanding balances report',
    description:
      'Returns detailed breakdown of all outstanding invoices per client with payment status',
  })
  @ApiResponse({
    status: 200,
    description: 'Outstanding balances report generated successfully',
    type: OutstandingBalanceReportDto,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter from date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter to date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'clientId',
    required: false,
    description: 'Filter by client UUID',
  })
  async getOutstandingBalances(@Query() filters: ReportFiltersDto) {
    const parsedFilters = {
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      clientId: filters.clientId,
    };

    const result =
      await this.getOutstandingBalancesUseCase.execute(parsedFilters);
    return result.toObject();
  }

  @Get('revenue')
  @ApiOperation({
    summary: 'Get revenue report',
    description:
      'Returns revenue aggregated by client or location based on groupBy parameter',
  })
  @ApiResponse({
    status: 200,
    description: 'Revenue report generated successfully',
    type: RevenueByClientReportDto,
  })
  @ApiQuery({
    name: 'groupBy',
    required: true,
    enum: RevenueGroupBy,
    description: 'Group by client or location',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter from date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter to date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'clientId',
    required: false,
    description: 'Filter by client UUID',
  })
  @ApiQuery({ name: 'city', required: false, description: 'Filter by city' })
  @ApiQuery({
    name: 'region',
    required: false,
    description: 'Filter by region',
  })
  async getRevenueReport(@Query() filters: RevenueReportFiltersDto) {
    const parsedFilters = {
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      clientId: filters.clientId,
      city: filters.city,
      region: filters.region,
    };

    const result = await this.getRevenueReportUseCase.execute(
      filters.groupBy,
      parsedFilters,
    );
    return result.toObject();
  }

  @Get('petty-cash')
  @ApiOperation({
    summary: 'Get petty cash summary report',
    description:
      'Returns detailed petty cash transactions with balances and categories',
  })
  @ApiResponse({
    status: 200,
    description: 'Petty cash report generated successfully',
    type: PettyCashReportDto,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter from date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter to date (YYYY-MM-DD)',
  })
  async getPettyCashReport(@Query() filters: ReportFiltersDto) {
    const parsedFilters = {
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    };

    const result = await this.getPettyCashReportUseCase.execute(parsedFilters);
    return result.toObject();
  }

  @Get('other-income')
  @ApiOperation({
    summary: 'Get other income report',
    description:
      'Returns aggregated income from sources like recycling with unit prices and totals',
  })
  @ApiResponse({
    status: 200,
    description: 'Other income report generated successfully',
    type: OtherIncomeReportDto,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter from date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter to date (YYYY-MM-DD)',
  })
  async getOtherIncomeReport(@Query() filters: ReportFiltersDto) {
    const parsedFilters = {
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    };

    const result =
      await this.getOtherIncomeReportUseCase.execute(parsedFilters);
    return result.toObject();
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Get summary statistics',
    description:
      'Returns high-level summary statistics including clients, revenue, invoices, and balances',
  })
  @ApiResponse({
    status: 200,
    description: 'Summary statistics generated successfully',
    type: SummaryStatisticsReportDto,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter from date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter to date (YYYY-MM-DD)',
  })
  async getSummaryStatistics(@Query() filters: ReportFiltersDto) {
    const parsedFilters = {
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    };

    const result =
      await this.getSummaryStatisticsUseCase.execute(parsedFilters);
    return result.toObject();
  }

  @Get('export/:reportType')
  @ApiOperation({
    summary: 'Export report to Excel',
    description: 'Exports the specified report type to Excel format (.xlsx)',
  })
  @ApiProduces(
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @ApiResponse({
    status: 200,
    description: 'Excel file generated successfully',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid report type',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter from date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter to date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'clientId',
    required: false,
    description: 'Filter by client UUID',
  })
  @ApiQuery({
    name: 'groupBy',
    required: false,
    enum: RevenueGroupBy,
    description: 'For revenue reports: group by client or location',
  })
  async exportReport(
    @Param('reportType') reportType: string,
    @Query() filters: any,
    @Res() res: Response,
  ) {
    const parsedFilters = {
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      clientId: filters.clientId,
    };

    let report;
    let filename: string;

    switch (reportType) {
      case 'outstanding-balances':
        report =
          await this.getOutstandingBalancesUseCase.execute(parsedFilters);
        filename = `outstanding-balances-${new Date().toISOString().split('T')[0]}.xlsx`;
        break;

      case 'revenue':
        const groupBy = filters.groupBy || RevenueGroupBy.CLIENT;
        report = await this.getRevenueReportUseCase.execute(
          groupBy,
          parsedFilters,
        );
        filename = `revenue-${groupBy}-${new Date().toISOString().split('T')[0]}.xlsx`;
        break;

      case 'petty-cash':
        report = await this.getPettyCashReportUseCase.execute(parsedFilters);
        filename = `petty-cash-${new Date().toISOString().split('T')[0]}.xlsx`;
        break;

      case 'other-income':
        report = await this.getOtherIncomeReportUseCase.execute(parsedFilters);
        filename = `other-income-${new Date().toISOString().split('T')[0]}.xlsx`;
        break;

      case 'payments':
        report = await this.getPaymentReportUseCase.execute(parsedFilters);
        console.log('Report type:', report.type); // Add this debug line
        console.log('ReportType.PAYMENTS:', ReportType.PAYMENTS); // Add this debug line
        filename = `payments-${new Date().toISOString().split('T')[0]}.xlsx`;
        break;

      case 'invoices':
        report = await this.getPaymentReportUseCase.execute(parsedFilters);
        filename = `payments-${new Date().toISOString().split('T')[0]}.xlsx`;
        break;

      default:
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Invalid report type',
          validTypes: [
            'outstanding-balances',
            'revenue',
            'petty-cash',
            'other-income',
            'payments',
            'invoices',
          ],
        });
    }

    const buffer = await this.exportReportToExcelUseCase.execute(
      report.type as ReportType,
      report.data,
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get('expense-income-chart')
  @ApiOperation({
    summary: 'Get expense vs income chart data',
    description:
      'Returns monthly totals for expenses and income for chart visualization',
  })
  @ApiResponse({
    status: 200,
    description: 'Chart data generated successfully',
    schema: {
      type: 'object',
      properties: {
        incomeData: {
          type: 'array',
          items: { type: 'number' },
          example: [
            65000, 59000, 80000, 81000, 56000, 55000, 40000, 43000, 48000,
            52000, 75000, 68000,
          ],
        },
        expenseData: {
          type: 'array',
          items: { type: 'number' },
          example: [
            28000, 48000, 40000, 19000, 86000, 27000, 90000, 31000, 45000,
            38000, 29000, 42000,
          ],
        },
      },
    },
  })
  @ApiQuery({
    name: 'year',
    required: true,
    description: 'Year for the report (e.g., 2024)',
    type: Number,
  })
  async getExpenseIncomeChart(@Query('year') year: number) {
    return await this.getExpenseIncomeChartUseCase.execute(year);
  }

  @Get('payments')
  @ApiOperation({
    summary: 'Get payments report',
    description:
      'Returns all payments with client details and applied invoices',
  })
  @ApiResponse({
    status: 200,
    description: 'Payments report generated successfully',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter from date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter to date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'clientId',
    required: false,
    description: 'Filter by client UUID',
  })
  async getPaymentsReport(@Query() filters: ReportFiltersDto) {
    const parsedFilters = {
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      clientId: filters.clientId,
    };

    return await this.getPaymentReportUseCase.execute(parsedFilters);
  }

  @Public()
  @Get('invoices')
  @ApiOperation({
    summary: 'Get invoices report',
    description:
      'Returns all invoices with client details and applied invoices',
  })
  @ApiResponse({
    status: 200,
    description: 'invoices report generated successfully',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter from date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter to date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by client UUID',
  })
  async getInvoiceReport(@Query() filters: ReportFiltersDto) {
    const parsedFilters = {
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      status: filters.status,
    };

    return await this.getInvoiceReportUsecase.execute(parsedFilters);
  }
}
