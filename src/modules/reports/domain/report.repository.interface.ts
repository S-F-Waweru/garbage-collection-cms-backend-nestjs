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
  getPaymentSummary(filters?: ReportFilters): Promise<PaymentSummaryItem[]>;
}
export const IReportRepository = Symbol('IReportRepository');

export interface PaymentSummaryItem {
  paymentNumber: string;
  clientId: string;
  clientFirstName: string;
  clientLastName: string;
  amount: number;
  paymentMethod: string;
  paymentDate: Date;
  referenceNumber: string;
  appliedToInvoices: any[];
  excessAmount: number;
}
