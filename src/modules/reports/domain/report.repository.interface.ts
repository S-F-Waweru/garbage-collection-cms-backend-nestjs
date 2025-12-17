// domain/report.repository.interface.ts

import {
  OutstandingBalanceItem,
  RevenueByClientItem,
  RevenueByLocationItem,
  PettyCashItem,
  OtherIncomeItem,
  ReportSummary,
} from './report-result.entity';

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  clientId?: string;
  city?: string;
  region?: string;
}

export interface IReportRepository {
  getOutstandingBalances( // done ✅
    filters?: ReportFilters,
  ): Promise<OutstandingBalanceItem[]>;

  getRevenueByClient(filters?: ReportFilters): Promise<RevenueByClientItem[]>; // done ✅
  getRevenueByLocation(
    filters?: ReportFilters,
  ): Promise<RevenueByLocationItem[]>;
  getPettyCashSummary(filters?: ReportFilters): Promise<PettyCashItem[]>;
  getOtherIncome(filters?: ReportFilters): Promise<OtherIncomeItem[]>;
  getSummaryStatistics(filters?: ReportFilters): Promise<ReportSummary>;
}

export const IReportRepository = Symbol('IReportRepository');
