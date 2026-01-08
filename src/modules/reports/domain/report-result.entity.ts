// domain/entities/report-result.entity.ts
import { BaseEntity } from 'src/shared/domain/entities/base.entity';

export enum ReportType {
  OUTSTANDING_BALANCES = 'OUTSTANDING_BALANCES',
  REVENUE_BY_CLIENT = 'REVENUE_BY_CLIENT',
  REVENUE_BY_LOCATION = 'REVENUE_BY_LOCATION',
  PETTY_CASH = 'PETTY_CASH',
  OTHER_INCOME = 'OTHER_INCOME',
  SUMMARY = 'SUMMARY',
  PAYMENTS = 'PAYMENTS',
}

export interface OutstandingBalanceItem {
  clientId: string;
  clientName: string;
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  status: string;
  daysOverdue: number;
}

export interface RevenueByClientItem {
  clientId: string;
  clientName: string;
  location: string;
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  invoiceCount: number;
}

export interface RevenueByLocationItem {
  city: string;
  region: string;
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  clientCount: number;
  invoiceCount: number;
}

export interface PettyCashItem {
  id: string;
  date: Date;
  type: 'IN' | 'OUT';
  amount: number;
  purpose: string;
  category: string;
  source: string;
  balance: number;
  enteredBy: string;
}

export interface OtherIncomeItem {
  id: string;
  date: Date;
  source: string;
  itemType: string;
  unitPrice: number;
  quantity: number;
  total: number;
  enteredBy: string;
}

export interface ReportSummary {
  totalClients: number;
  activeClients: number;
  totalRevenue: number;
  totalOutstanding: number;
  totalPaid: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  averageInvoiceAmount: number;
  pettyCashBalance: number;
  otherIncomeTotal: number;
  reportPeriod: {
    startDate: Date;
    endDate: Date;
  };
}

interface ReportResultProps {
  type: ReportType;
  data: any;
  generatedAt: Date;
  filters: Record<string, any>;
  totalRecords: number;
}

export class ReportResult extends BaseEntity {
  private _type: ReportType;
  private _data: any;
  private _generatedAt: Date;
  private _filters: Record<string, any>;
  private _totalRecords: number;

  private constructor(props: ReportResultProps, id?: string) {
    super(id);
    this._type = props.type;
    this._data = props.data;
    this._generatedAt = props.generatedAt;
    this._filters = props.filters;
    this._totalRecords = props.totalRecords;
  }

  get type(): ReportType {
    return this._type;
  }

  get data(): any {
    return this._data;
  }

  get generatedAt(): Date {
    return this._generatedAt;
  }

  get filters(): Record<string, any> {
    return this._filters;
  }

  get totalRecords(): number {
    return this._totalRecords;
  }

  static create(props: ReportResultProps): ReportResult {
    return new ReportResult(props);
  }

  toObject() {
    return {
      id: this._id,
      type: this._type,
      data: this._data,
      generatedAt: this._generatedAt,
      filters: this._filters,
      totalRecords: this._totalRecords,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
