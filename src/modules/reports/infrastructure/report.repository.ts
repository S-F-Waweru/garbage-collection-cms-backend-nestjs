// infrastructure/report.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  IReportRepository,
  ReportFilters,
} from '../domain/report.repository.interface';
import { InvoiceSchema } from 'src/modules/invoices/infrasctructure/invoice.rschema';
import {
  OutstandingBalanceItem,
  RevenueByClientItem,
  RevenueByLocationItem,
  PettyCashItem,
  OtherIncomeItem,
  ReportSummary,
} from '../domain/report-result.entity';

// Import other schemas as needed

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
        'c.firstName as "clientFirstName"', // Add closing quote here
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

    return query.getRawMany();
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

    if (filters?.startDate) {
      query = query.andWhere('"i"."invoiceDate" >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      query = query.andWhere('"i"."invoiceDate" <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (filters?.clientId) {
      query = query.andWhere('"i"."clientId" = :clientId', {
        clientId: filters.clientId,
      });
    }

    query = query
      .groupBy('"i"."clientId", "c"."firstName", "c"."lastName"')
      .orderBy('"totalInvoiced"', 'DESC');

    const results = await query.getRawMany();

    return results.map((r) => ({
      ...r,
      totalInvoiced: parseFloat(r.totalInvoiced || 0),
      totalPaid: parseFloat(r.totalPaid || 0),
      totalOutstanding: parseFloat(r.totalOutstanding || 0),
      invoiceCount: parseInt(r.invoiceCount || 0),
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

    if (filters?.startDate) {
      query = query.andWhere('"i"."invoiceDate" >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      query = query.andWhere('"i"."invoiceDate" <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (filters?.city) {
      query = query.andWhere('"l"."city" = :city', { city: filters.city });
    }

    if (filters?.region) {
      query = query.andWhere('"l"."region" = :region', {
        region: filters.region,
      });
    }

    query = query
      .groupBy('"l"."city", "l"."region"')
      .orderBy('"totalInvoiced"', 'DESC');

    const results = await query.getRawMany();

    return results.map((r) => ({
      ...r,
      totalInvoiced: parseFloat(r.totalInvoiced || 0),
      totalPaid: parseFloat(r.totalPaid || 0),
      totalOutstanding: parseFloat(r.totalOutstanding || 0),
      clientCount: parseInt(r.clientCount || 0),
      invoiceCount: parseInt(r.invoiceCount || 0),
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
        '"pc"."oi.createdAt"::uuid = "u"."id" AND "u"."deletedAt" IS NULL',
      )
      .where('pc.deletedAt IS NULL');

    if (filters?.startDate) {
      query = query.andWhere('pc.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      query = query.andWhere('pc.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    query = query.orderBy('pc.createdAt', 'DESC');

    const results = await query.getRawMany();

    return results.map((r) => ({
      ...r,
      totalAmount: parseFloat(r.totalAmount || '0'),
      // balance: parseFloat(r.balance || '0'), // uncomment if balance exists
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
        'oi.recordedAt as "recordedAt"',
        'oi.unitPrice * oi.unitCount as "total"',
        'oi.recordedBy as "enteredBy"',
      ])
      .from('income_records', 'oi')
      .leftJoin('users', 'u', '"oi"."recordedBy"::uuid = "u"."id"')
      .where('oi.deletedAt IS NULL');

    if (filters?.startDate) {
      query = query.andWhere('oi.recordedAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      query = query.andWhere('oi.recordedAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    query = query.orderBy('oi.recordedAt', 'DESC');

    const results = await query.getRawMany();

    return results.map((r) => ({
      ...r,
      unitPrice: parseFloat(r.unitPrice || '0'),
      quantity: parseFloat(r.unitCount || '0'),
      total: parseFloat(r.total || '0'),
    }));
  }

  async getSummaryStatistics(filters?: ReportFilters): Promise<ReportSummary> {
    // Total clients
    const clientQuery = this.dataSource
      .createQueryBuilder()
      .select(['COUNT(*) as "totalClients"'])
      .from('clients', 'c');

    const clientStats = await clientQuery.getRawOne();

    // Invoice stats
    let invoiceQuery = this.dataSource
      .createQueryBuilder()
      .select([
        'SUM(i."totalAmount") as "totalRevenue"',
        'SUM(i."balance") as "totalOutstanding"',
        'SUM(i."amountPaid") as "totalPaid"',
        'COUNT(*) as "totalInvoices"',
        `COUNT(CASE WHEN i.status = 'PAID' THEN 1 END) as "paidInvoices"`,
        `COUNT(CASE WHEN i.status = 'PENDING' THEN 1 END) as "pendingInvoices"`,
        `COUNT(CASE WHEN i.status = 'OVERDUE' THEN 1 END) as "overdueInvoices"`,
        `COUNT(CASE WHEN i.status = 'PARTIALLY_PAID' THEN 1 END) as "partialInvoices"`, // Add this
        'AVG(i."totalAmount") as "averageInvoiceAmount"',
      ])
      .from('invoices', 'i')
      .where('i.status != :cancelled', { cancelled: 'CANCELLED' });

    if (filters?.startDate) {
      invoiceQuery = invoiceQuery.andWhere('i.invoiceDate >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      invoiceQuery = invoiceQuery.andWhere('i.invoiceDate <= :endDate', {
        endDate: filters.endDate,
      });
    }

    const invoiceStats = await invoiceQuery.getRawOne();

    // Petty cash balance
    const pettyCashQuery = this.dataSource
      .createQueryBuilder()
      .select('pc.totalAmount', 'totalAmount')
      .from('petty_cashes', 'pc')
      .orderBy('pc.createdAt', 'DESC')
      .limit(1);

    const pettyCash = await pettyCashQuery.getRawOne();

    // Other income total
    let otherIncomeQuery = this.dataSource
      .createQueryBuilder()
      .select('SUM(oi."unitPrice" * oi."unitCount") as "otherIncomeTotal"')
      .from('income_records', 'oi');

    if (filters?.startDate) {
      otherIncomeQuery = otherIncomeQuery.andWhere(
        'oi.createdAt >= :startDate',
        {
          startDate: filters.startDate,
        },
      );
    }

    if (filters?.endDate) {
      otherIncomeQuery = otherIncomeQuery.andWhere('oi.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    const otherIncome = await otherIncomeQuery.getRawOne();

    return {
      totalClients: parseInt(clientStats?.totalClients || 0),
      activeClients: parseInt(clientStats?.activeClients || 0),
      totalRevenue: parseFloat(invoiceStats?.totalRevenue || 0),
      totalOutstanding: parseFloat(invoiceStats?.totalOutstanding || 0),
      totalPaid: parseFloat(invoiceStats?.totalPaid || 0),
      totalInvoices: parseInt(invoiceStats?.totalInvoices || 0),
      paidInvoices: parseInt(invoiceStats?.paidInvoices || 0),
      pendingInvoices: parseInt(invoiceStats?.pendingInvoices || 0),
      overdueInvoices: parseInt(invoiceStats?.overdueInvoices || 0),
      averageInvoiceAmount: parseFloat(invoiceStats?.averageInvoiceAmount || 0),
      pettyCashBalance: parseFloat(pettyCash?.balance || 0),
      otherIncomeTotal: parseFloat(otherIncome?.otherIncomeTotal || 0),
      reportPeriod: {
        startDate: filters?.startDate || new Date(0),
        endDate: filters?.endDate || new Date(),
      },
    };
  }
}
