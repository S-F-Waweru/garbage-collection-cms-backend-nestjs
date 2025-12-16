// application/dto/report-filters.dto.ts
import { IsOptional, IsDateString, IsUUID, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';

export class ReportFiltersDto {
  @ApiPropertyOptional({
    description: 'Start date for filtering (ISO format)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering (ISO format)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by specific client UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiPropertyOptional({
    description: 'Filter by city',
    example: 'Nairobi',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Filter by region/area',
    example: 'Westlands',
  })
  @IsOptional()
  @IsString()
  region?: string;
}
// application/dto/revenue-report-filters.dto.ts
import { IsEnum } from 'class-validator';

export enum RevenueGroupBy {
  CLIENT = 'client',
  LOCATION = 'location',
}

export class RevenueReportFiltersDto extends ReportFiltersDto {
  @ApiProperty({
    enum: RevenueGroupBy,
    description: 'Group revenue by client or location',
    example: RevenueGroupBy.CLIENT,
  })
  @IsEnum(RevenueGroupBy)
  groupBy: RevenueGroupBy;
}

// application/dto/outstanding-balance-response.dto.ts

export class OutstandingBalanceItemDto {
  @ApiProperty({ description: 'Client UUID' })
  clientId: string;

  @ApiProperty({ description: 'Client name' })
  clientName: string;

  @ApiProperty({ description: 'Invoice UUID' })
  invoiceId: string;

  @ApiProperty({ description: 'Invoice number', example: 'INV-2024-0001' })
  invoiceNumber: string;

  @ApiProperty({ description: 'Invoice generation date' })
  invoiceDate: Date;

  @ApiProperty({ description: 'Payment due date' })
  dueDate: Date;

  @ApiProperty({ description: 'Total invoice amount' })
  totalAmount: number;

  @ApiProperty({ description: 'Amount paid so far' })
  amountPaid: number;

  @ApiProperty({ description: 'Remaining balance' })
  balance: number;

  @ApiProperty({ description: 'Invoice status' })
  status: string;

  @ApiProperty({ description: 'Number of days past due date' })
  daysOverdue: number;
}

export class OutstandingBalanceReportDto {
  @ApiProperty({ description: 'Report type', example: 'OUTSTANDING_BALANCES' })
  type: string;

  @ApiProperty({
    type: [OutstandingBalanceItemDto],
    description: 'Outstanding balance items',
  })
  data: OutstandingBalanceItemDto[];

  @ApiProperty({ description: 'Report generation timestamp' })
  generatedAt: Date;

  @ApiProperty({ description: 'Applied filters' })
  filters: Record<string, any>;

  @ApiProperty({ description: 'Total number of records' })
  totalRecords: number;
}
// application/dto/revenue-report-response.dto.ts

export class RevenueByClientItemDto {
  @ApiProperty({ description: 'Client UUID' })
  clientId: string;

  @ApiProperty({ description: 'Client name' })
  clientName: string;

  @ApiProperty({ description: 'Client location' })
  location: string;

  @ApiProperty({ description: 'Total amount invoiced' })
  totalInvoiced: number;

  @ApiProperty({ description: 'Total amount paid' })
  totalPaid: number;

  @ApiProperty({ description: 'Total outstanding balance' })
  totalOutstanding: number;

  @ApiProperty({ description: 'Number of invoices' })
  invoiceCount: number;
}

export class RevenueByLocationItemDto {
  @ApiProperty({ description: 'City name' })
  city: string;

  @ApiProperty({ description: 'Region/Area name' })
  region: string;

  @ApiProperty({ description: 'Total amount invoiced' })
  totalInvoiced: number;

  @ApiProperty({ description: 'Total amount paid' })
  totalPaid: number;

  @ApiProperty({ description: 'Total outstanding balance' })
  totalOutstanding: number;

  @ApiProperty({ description: 'Number of clients' })
  clientCount: number;

  @ApiProperty({ description: 'Number of invoices' })
  invoiceCount: number;
}

export class RevenueByClientReportDto {
  @ApiProperty({ description: 'Report type', example: 'REVENUE_BY_CLIENT' })
  type: string;

  @ApiProperty({
    type: [RevenueByClientItemDto],
    description: 'Revenue by client items',
  })
  data: RevenueByClientItemDto[];

  @ApiProperty({ description: 'Report generation timestamp' })
  generatedAt: Date;

  @ApiProperty({ description: 'Applied filters' })
  filters: Record<string, any>;

  @ApiProperty({ description: 'Total number of records' })
  totalRecords: number;
}

export class RevenueByLocationReportDto {
  @ApiProperty({ description: 'Report type', example: 'REVENUE_BY_LOCATION' })
  type: string;

  @ApiProperty({
    type: [RevenueByLocationItemDto],
    description: 'Revenue by location items',
  })
  data: RevenueByLocationItemDto[];

  @ApiProperty({ description: 'Report generation timestamp' })
  generatedAt: Date;

  @ApiProperty({ description: 'Applied filters' })
  filters: Record<string, any>;

  @ApiProperty({ description: 'Total number of records' })
  totalRecords: number;
}

// application/dto/petty-cash-report-response.dto.ts

export class PettyCashItemDto {
  @ApiProperty({ description: 'Transaction UUID' })
  id: string;

  @ApiProperty({ description: 'Transaction date' })
  date: Date;

  @ApiProperty({
    description: 'Transaction type (IN/OUT)',
    enum: ['IN', 'OUT'],
  })
  type: 'IN' | 'OUT';

  @ApiProperty({ description: 'Transaction amount' })
  amount: number;

  @ApiProperty({ description: 'Purpose of transaction' })
  purpose: string;

  @ApiProperty({ description: 'Expense category' })
  category: string;

  @ApiProperty({ description: 'Payment source' })
  source: string;

  @ApiProperty({ description: 'Balance after transaction' })
  balance: number;

  @ApiProperty({ description: 'User who entered the transaction' })
  enteredBy: string;
}

export class PettyCashReportDto {
  @ApiProperty({ description: 'Report type', example: 'PETTY_CASH' })
  type: string;

  @ApiProperty({
    type: [PettyCashItemDto],
    description: 'Petty cash transactions',
  })
  data: PettyCashItemDto[];

  @ApiProperty({ description: 'Report generation timestamp' })
  generatedAt: Date;

  @ApiProperty({ description: 'Applied filters' })
  filters: Record<string, any>;

  @ApiProperty({ description: 'Total number of records' })
  totalRecords: number;
}
// application/dto/other-income-report-response.dto.ts

export class OtherIncomeItemDto {
  @ApiProperty({ description: 'Income record UUID' })
  id: string;

  @ApiProperty({ description: 'Income date' })
  date: Date;

  @ApiProperty({ description: 'Income source', example: 'Recycling' })
  source: string;

  @ApiProperty({ description: 'Item type', example: 'Plastic bottles' })
  itemType: string;

  @ApiProperty({ description: 'Unit price' })
  unitPrice: number;

  @ApiProperty({ description: 'Quantity' })
  quantity: number;

  @ApiProperty({ description: 'Total income amount' })
  total: number;

  @ApiProperty({ description: 'User who entered the record' })
  enteredBy: string;
}

export class OtherIncomeReportDto {
  @ApiProperty({ description: 'Report type', example: 'OTHER_INCOME' })
  type: string;

  @ApiProperty({
    type: [OtherIncomeItemDto],
    description: 'Other income items',
  })
  data: OtherIncomeItemDto[];

  @ApiProperty({ description: 'Report generation timestamp' })
  generatedAt: Date;

  @ApiProperty({ description: 'Applied filters' })
  filters: Record<string, any>;

  @ApiProperty({ description: 'Total number of records' })
  totalRecords: number;
}
// application/dto/summary-statistics-response.dto.ts

class ReportPeriodDto {
  @ApiProperty({ description: 'Period start date' })
  startDate: Date;

  @ApiProperty({ description: 'Period end date' })
  endDate: Date;
}

export class SummaryStatisticsDto {
  @ApiProperty({ description: 'Total number of clients' })
  totalClients: number;

  @ApiProperty({ description: 'Number of active clients' })
  activeClients: number;

  @ApiProperty({ description: 'Total revenue generated' })
  totalRevenue: number;

  @ApiProperty({ description: 'Total outstanding balance' })
  totalOutstanding: number;

  @ApiProperty({ description: 'Total amount paid' })
  totalPaid: number;

  @ApiProperty({ description: 'Total number of invoices' })
  totalInvoices: number;

  @ApiProperty({ description: 'Number of paid invoices' })
  paidInvoices: number;

  @ApiProperty({ description: 'Number of pending invoices' })
  pendingInvoices: number;

  @ApiProperty({ description: 'Number of overdue invoices' })
  overdueInvoices: number;

  @ApiProperty({ description: 'Average invoice amount' })
  averageInvoiceAmount: number;

  @ApiProperty({ description: 'Current petty cash balance' })
  pettyCashBalance: number;

  @ApiProperty({ description: 'Total other income' })
  otherIncomeTotal: number;

  @ApiProperty({ type: ReportPeriodDto, description: 'Report period' })
  reportPeriod: ReportPeriodDto;
}

export class SummaryStatisticsReportDto {
  @ApiProperty({ description: 'Report type', example: 'SUMMARY' })
  type: string;

  @ApiProperty({
    type: SummaryStatisticsDto,
    description: 'Summary statistics',
  })
  data: SummaryStatisticsDto;

  @ApiProperty({ description: 'Report generation timestamp' })
  generatedAt: Date;

  @ApiProperty({ description: 'Applied filters' })
  filters: Record<string, any>;

  @ApiProperty({ description: 'Total number of records', example: 1 })
  totalRecords: number;
}
