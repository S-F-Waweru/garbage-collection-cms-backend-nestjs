import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  InvoiceSummaryItem,
  IReportRepository,
  PaymentSummaryItem,
  ReportFilters,
} from '../domain/report.repository.interface';
import { InvoiceSchema } from 'src/modules/invoices/infrasctructure/invoice.schema';
import {
  OutstandingBalanceItem,
  RevenueByClientItem,
  RevenueByLocationItem,
  PettyCashItem,
  OtherIncomeItem,
  ReportSummary,
} from '../domain/report-result.entity';

@Injectable()
export class ReportRepository implements IReportRepository {
  constructor(
    @InjectRepository(InvoiceSchema)
    private readonly invoiceRepo: Repository<InvoiceSchema>,
    private readonly dataSource: DataSource,
  ) {}

  async getOutstandingBalances(
    filters?: ReportFilters,
  ): Promise<OutstandingBalanceItem[]> {
    let query = this.dataSource
      .createQueryBuilder()
      .select([
        'i.clientId as "clientId"',
        'c.firstName as "clientFirstName"',
        'c.lastName as "clientLastName"',
        'i.id as "invoiceId"',
        'i.invoiceNumber as "invoiceNumber"',
        'i.invoiceDate as "invoiceDate"',
        'i.dueDate as "dueDate"',
        'i.totalAmount as "totalAmount"',
        'i.amountPaid as "amountPaid"',
        'i.balance as "balance"',
        'i.status as "status"',
        'CASE WHEN i.dueDate < CURRENT_DATE THEN CURRENT_DATE - i.dueDate ELSE 0 END as "daysOverdue"',
      ])
      .from('invoices', 'i')
      .leftJoin('clients', 'c', 'i.clientId = c.id')
      .where('i.balance > 0')
      .andWhere('i.status != :cancelled', { cancelled: 'CANCELLED' });

    if (filters?.startDate) {
      query = query.andWhere('i.invoiceDate >= :startDate', {
        startDate: filters.startDate,
      });
    }
    if (filters?.endDate) {
      query = query.andWhere('i.invoiceDate <= :endDate', {
        endDate: filters.endDate,
      });
    }
    if (filters?.clientId) {
      query = query.andWhere('i.clientId = :clientId', {
        clientId: filters.clientId,
      });
    }

    query = query.orderBy('i.invoiceDate', 'ASC');

    const results = await query.getRawMany();
    return results.map((r) => ({
      ...r,
      totalAmount: this.fromCents(this.toCents(r.totalAmount)),
      amountPaid: this.fromCents(this.toCents(r.amountPaid)),
      balance: this.fromCents(this.toCents(r.balance)),
    }));
  }

  async getPaymentSummary(
    filters?: ReportFilters,
  ): Promise<PaymentSummaryItem[]> {
    let query = this.dataSource
      .createQueryBuilder()
      .select([
        'p.paymentNumber as "paymentNumber"',
        'p.clientId as "clientId"',
        'c.firstName as "clientFirstName"',
        'c.lastName as "clientLastName"',
        'p.amount as "amount"',
        'p.paymentMethod as "paymentMethod"',
        'p.paymentDate as "paymentDate"',
        'p.referenceNumber as "referenceNumber"',
        'p.appliedToInvoices as "appliedToInvoices"',
        'p.excessAmount as "excessAmount"',
      ])
      .from('payments', 'p')
      .leftJoin('clients', 'c', 'p.clientId = c.id AND c.deletedAt IS NULL');
    // .where('p.deletedAt IS NULL');
    if (filters?.startDate) {
      query = query.andWhere('p.paymentDate >= :startDate', {
        startDate: filters.startDate,
      });
    }
    if (filters?.endDate) {
      query = query.andWhere('p.paymentDate <= :endDate', {
        endDate: filters.endDate,
      });
    }
    if (filters?.clientId) {
      query = query.andWhere('p.clientId = :clientId', {
        clientId: filters.clientId,
      });
    }

    query = query.orderBy('p.paymentDate', 'DESC');

    const results = await query.getRawMany();
    return results.map((r) => ({
      ...r,
      amount: this.fromCents(this.toCents(r.amount)),
      excessAmount: this.fromCents(this.toCents(r.excessAmount)),
    }));
  }

  private toCents(amount: string | number | null | undefined): number {
    return Math.round((Number(amount) || 0) * 100);
  }

  private fromCents(cents: number): number {
    return cents / 100;
  }

  async getInvoiceSummary(
    filters?: ReportFilters,
  ): Promise<InvoiceSummaryItem[]> {
    let query = this.dataSource
      .createQueryBuilder()
      .select([
        'i.id as "id"',
        'i.invoiceNumber as "invoiceNumber"',
        'i.clientId as "clientId"',
        'c.firstName as "clientFirstName"',
        'c.lastName as "clientLastName"',
        'i.invoiceDate as "invoiceDate"',
        'i.dueDate as "dueDate"',
        'i.totalAmount as "totalAmount"',
        'i.amountPaid as "amountPaid"',
        'i.balance as "balance"',
        'i.status as "status"',
      ])
      .from(InvoiceSchema, 'i')
      .leftJoin('clients', 'c', 'i.clientId = c.id AND c.deletedAt IS NULL')
      .where('i.deletedAt IS NULL');

    // Apply dynamic filters
    if (filters?.startDate) {
      query = query.andWhere('i.invoiceDate >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      query = query.andWhere('i.invoiceDate <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (filters?.clientId) {
      query = query.andWhere('i.clientId = :clientId', {
        clientId: filters.clientId,
      });
    }

    // Execute and format financial values
    const results = await query.getRawMany();

    return results.map((r) => ({
      ...r,
      // Converting to cents and back ensures we handle floating point
      // precision issues often found in 'decimal' or 'numeric' types
      totalAmount: this.fromCents(this.toCents(r.totalAmount)),
      amountPaid: this.fromCents(this.toCents(r.amountPaid)),
      balance: this.fromCents(this.toCents(r.balance)),
    }));
  }

  async getRevenueByClient(
    filters?: ReportFilters,
  ): Promise<RevenueByClientItem[]> {
    let query = this.dataSource
      .createQueryBuilder()
      .select([
        '"i"."clientId" as "clientId"',
        '"c"."firstName" as "clientFirstName"',
        '"c"."lastName" as "clientLastName"',
        'SUM("i"."totalAmount") as "totalInvoiced"',
        'SUM("i"."amountPaid") as "totalPaid"',
        'SUM("i"."balance") as "totalOutstanding"',
        'COUNT("i"."id") as "invoiceCount"',
      ])
      .from('invoices', 'i')
      .leftJoin(
        'clients',
        'c',
        '"i"."clientId" = "c"."id" AND "c"."deletedAt" IS NULL',
      )
      .andWhere('"i"."status" != :cancelled', { cancelled: 'CANCELLED' })
      .andWhere('"i"."deletedAt" IS NULL');

    if (filters?.startDate)
      query = query.andWhere('"i"."invoiceDate" >= :startDate', {
        startDate: filters.startDate,
      });
    if (filters?.endDate)
      query = query.andWhere('"i"."invoiceDate" <= :endDate', {
        endDate: filters.endDate,
      });
    if (filters?.clientId)
      query = query.andWhere('"i"."clientId" = :clientId', {
        clientId: filters.clientId,
      });

    query = query
      .groupBy('"i"."clientId", "c"."firstName", "c"."lastName"')
      .orderBy('"totalInvoiced"', 'DESC');

    const results = await query.getRawMany();

    return results.map((r) => ({
      ...r,
      totalInvoiced: this.fromCents(this.toCents(r.totalInvoiced)),
      totalPaid: this.fromCents(this.toCents(r.totalPaid)),
      totalOutstanding: this.fromCents(this.toCents(r.totalOutstanding)),
      invoiceCount: parseInt(r.invoiceCount || '0', 10),
    }));
  }

  async getRevenueByLocation(
    filters?: ReportFilters,
  ): Promise<RevenueByLocationItem[]> {
    let query = this.dataSource
      .createQueryBuilder()
      .select([
        '"l"."city" as "city"',
        '"l"."region" as "region"',
        'SUM("i"."totalAmount") as "totalInvoiced"',
        'SUM("i"."amountPaid") as "totalPaid"',
        'SUM("i"."balance") as "totalOutstanding"',
        'COUNT(DISTINCT "c"."id") as "clientCount"',
        'COUNT("i"."id") as "invoiceCount"',
      ])
      .from('invoices', 'i')
      .leftJoin(
        'clients',
        'c',
        '"i"."clientId" = "c"."id" AND "c"."deletedAt" IS NULL',
      )
      .leftJoin(
        'buildings',
        'b',
        '"b"."clientId" = "c"."id" AND "b"."deletedAt" IS NULL',
      )
      .leftJoin(
        'locations',
        'l',
        '"b"."locationId" = "l"."id" AND "l"."deletedAt" IS NULL',
      )
      .where('"i"."status" != :cancelled', { cancelled: 'CANCELLED' })
      .andWhere('"i"."deletedAt" IS NULL');

    if (filters?.startDate)
      query = query.andWhere('"i"."invoiceDate" >= :startDate', {
        startDate: filters.startDate,
      });
    if (filters?.endDate)
      query = query.andWhere('"i"."invoiceDate" <= :endDate', {
        endDate: filters.endDate,
      });
    if (filters?.city)
      query = query.andWhere('"l"."city" = :city', { city: filters.city });
    if (filters?.region)
      query = query.andWhere('"l"."region" = :region', {
        region: filters.region,
      });

    query = query
      .groupBy('"l"."city", "l"."region"')
      .orderBy('"totalInvoiced"', 'DESC');

    const results = await query.getRawMany();
    return results.map((r) => ({
      ...r,
      totalInvoiced: this.fromCents(this.toCents(r.totalInvoiced)),
      totalPaid: this.fromCents(this.toCents(r.totalPaid)),
      totalOutstanding: this.fromCents(this.toCents(r.totalOutstanding)),
      clientCount: parseInt(r.clientCount || '0', 10),
      invoiceCount: parseInt(r.invoiceCount || '0', 10),
    }));
  }

  async getPettyCashSummary(filters?: ReportFilters): Promise<PettyCashItem[]> {
    let query = this.dataSource
      .createQueryBuilder()
      .select([
        'pc.id as "id"',
        'pc.createdAt as "createdAt"',
        'pc.totalAmount as "totalAmount"',
        'pc.name as "name"',
        'u.id as "enteredBy"',
      ])
      .from('petty_cashes', 'pc')
      .leftJoin(
        'users',
        'u',
        '"pc"."createdBy"::uuid = "u"."id" AND "u"."deletedAt" IS NULL',
      )
      .where('pc.deletedAt IS NULL');

    if (filters?.startDate)
      query = query.andWhere('pc.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    if (filters?.endDate)
      query = query.andWhere('pc.createdAt <= :endDate', {
        endDate: filters.endDate,
      });

    query = query.orderBy('pc.createdAt', 'DESC');
    const results = await query.getRawMany();
    return results.map((r) => ({
      ...r,
      totalAmount: this.fromCents(this.toCents(r.totalAmount)),
    }));
  }

  async getOtherIncome(filters?: ReportFilters): Promise<OtherIncomeItem[]> {
    let query = this.dataSource
      .createQueryBuilder()
      .select([
        'oi.id as "id"',
        'oi.recordedAt as "recordedAt"',
        'oi.clientName as "clientName"',
        'oi.unitType as "unitType"',
        'oi.unitPrice as "unitPrice"',
        'oi.unitCount as "unitCount"',
        'oi.unitPrice * oi.unitCount as "total"',
        'oi.recordedBy as "enteredBy"',
      ])
      .from('income_records', 'oi')
      .leftJoin('users', 'u', '"oi"."recordedBy"::uuid = "u"."id"')
      .where('oi.deletedAt IS NULL');

    if (filters?.startDate)
      query = query.andWhere('oi.recordedAt >= :startDate', {
        startDate: filters.startDate,
      });
    if (filters?.endDate)
      query = query.andWhere('oi.recordedAt <= :endDate', {
        endDate: filters.endDate,
      });

    query = query.orderBy('oi.recordedAt', 'DESC');
    const results = await query.getRawMany();
    return results.map((r) => ({
      ...r,
      unitPrice: this.fromCents(this.toCents(r.unitPrice)),
      quantity: this.fromCents(this.toCents(r.unitCount)),
      total: this.fromCents(this.toCents(r.total)),
    }));
  }

  async getSummaryStatistics(filters?: ReportFilters): Promise<ReportSummary> {
    const clientStats = await this.dataSource
      .createQueryBuilder()
      .select(['COUNT(*) as "totalClients"'])
      .from('clients', 'c')
      .getRawOne();

    const invoiceStats = await this.dataSource
      .createQueryBuilder()
      .select([
        'SUM(i."totalAmount") as "totalRevenue"',
        'SUM(i."balance") as "totalOutstanding"',
        'SUM(i."amountPaid") as "totalPaid"',
        'COUNT(*) as "totalInvoices"',
        `COUNT(CASE WHEN i.status = 'PAID' THEN 1 END) as "paidInvoices"`,
        `COUNT(CASE WHEN i.status = 'PENDING' THEN 1 END) as "pendingInvoices"`,
        `COUNT(CASE WHEN i.status = 'OVERDUE' THEN 1 END) as "overdueInvoices"`,
        `COUNT(CASE WHEN i.status = 'PARTIALLY_PAID' THEN 1 END) as "partialInvoices"`,
        'AVG(i."totalAmount") as "averageInvoiceAmount"',
      ])
      .from('invoices', 'i')
      .where('i.status != :cancelled', { cancelled: 'CANCELLED' })
      .getRawOne();

    const pettyCash = await this.dataSource
      .createQueryBuilder()
      .select('pc.totalAmount', 'totalAmount')
      .from('petty_cashes', 'pc')
      .orderBy('pc.createdAt', 'DESC')
      .limit(1)
      .getRawOne();

    const otherIncome = await this.dataSource
      .createQueryBuilder()
      .select('SUM(oi."unitPrice" * oi."unitCount") as "otherIncomeTotal"')
      .from('income_records', 'oi')
      .getRawOne();

    return {
      totalClients: parseInt(clientStats?.totalClients || '0', 10),
      activeClients: parseInt(clientStats?.activeClients || '0', 10),
      totalRevenue: this.fromCents(this.toCents(invoiceStats?.totalRevenue)),
      totalOutstanding: this.fromCents(
        this.toCents(invoiceStats?.totalOutstanding),
      ),
      totalPaid: this.fromCents(this.toCents(invoiceStats?.totalPaid)),
      totalInvoices: parseInt(invoiceStats?.totalInvoices || '0', 10),
      paidInvoices: parseInt(invoiceStats?.paidInvoices || '0', 10),
      pendingInvoices: parseInt(invoiceStats?.pendingInvoices || '0', 10),
      overdueInvoices: parseInt(invoiceStats?.overdueInvoices || '0', 10),
      averageInvoiceAmount: this.fromCents(
        this.toCents(invoiceStats?.averageInvoiceAmount),
      ),
      pettyCashBalance: this.fromCents(this.toCents(pettyCash?.totalAmount)),
      otherIncomeTotal: this.fromCents(
        this.toCents(otherIncome?.otherIncomeTotal),
      ),
      reportPeriod: {
        startDate: filters?.startDate || new Date(0),
        endDate: filters?.endDate || new Date(),
      },
    };
  }
}
