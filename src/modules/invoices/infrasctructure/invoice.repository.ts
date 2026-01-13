// infrastructure/invoice.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull, DeepPartial, Not } from 'typeorm';
import { Invoice } from '../domain/invoice.entity';
import {
  IInvoiceRepository,
  InvoiceFilters,
} from '../domain/invoice.repository.intreface';
import { InvoiceSchema } from './invoice.schema';
import { InvoiceStatus } from '../application/models';

@Injectable()
export class InvoiceRepository implements IInvoiceRepository {
  constructor(
    @InjectRepository(InvoiceSchema)
    private readonly repo: Repository<InvoiceSchema>,
    private readonly dataSource: DataSource,
  ) {}

  async getNextInvoiceNumber(): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const result = await queryRunner.query(
        `SELECT nextval('invoice_number_seq') as next_number`,
      );

      const sequenceNumber = result[0].next_number;
      const year = new Date().getFullYear();

      return `INV-${year}-${String(sequenceNumber).padStart(4, '0')}`;
    } finally {
      await queryRunner.release();
    }
  }

  // async save(invoice: Invoice): Promise<Invoice> {
  //   const data = invoice.toObject();
  //   const schema = this.repo.create(data);
  //   const saved = await this.repo.save(schema);
  //   const result = await this.repo.findOne({
  //     where: { id: invoice.id },
  //   });
  //   if (!result) {
  //     throw new NotFoundException('Resuls not found');
  //   }

  //   return this.toDomain(result);
  // }
  async save(invoice: Invoice): Promise<Invoice> {
    const data = invoice.toObject();

    // Check if this is an update or create
    const existing = await this.repo.findOne({ where: { id: invoice.id } });

    if (existing) {
      // Update existing
      Object.assign(existing, data);
      const savedSchema = await this.repo.save(existing);
      return this.toDomain(savedSchema);
    } else {
      // Create new - ensure we're creating a single entity
      const schema = this.repo.create(data as DeepPartial<InvoiceSchema>);
      const savedSchema = await this.repo.save(schema);
      return this.toDomain(savedSchema);
    }
  }

  async findById(id: string): Promise<Invoice | null> {
    const schema = await this.repo.findOne({ where: { id } });
    return schema ? this.toDomain(schema) : null;
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null> {
    const schema = await this.repo.findOne({ where: { invoiceNumber } });
    return schema ? this.toDomain(schema) : null;
  }

  async findByClient(clientId: string): Promise<Invoice[]> {
    const schemas = await this.repo.find({
      where: { clientId },
      order: { invoiceDate: 'DESC' },
    });
    return schemas.map((s) => this.toDomain(s));
  }

  async findOutstandingByClient(clientId: string): Promise<Invoice[]> {
    const schemas = await this.repo
      .createQueryBuilder('invoice')
      .where('invoice.clientId = :clientId', { clientId })
      .andWhere('invoice.balance > 0')
      .andWhere('invoice.status != :cancelled', {
        cancelled: InvoiceStatus.CANCELLED,
      })
      .orderBy('invoice.invoiceDate', 'ASC')
      .getMany();

    return schemas.map((s) => this.toDomain(s));
  }

  // async findAll(filters?: InvoiceFilters): Promise<Invoice[]> {
  //   const query = this.repo.createQueryBuilder('invoice');
  //
  //   if (filters?.clientId) {
  //     query.andWhere('invoice.clientId = :clientId', {
  //       clientId: filters.clientId,
  //     });
  //   }
  //   if (filters?.status) {
  //     query.andWhere('invoice.status = :status', { status: filters.status });
  //   }
  //   if (filters?.fromDate) {
  //     query.andWhere('invoice.invoiceDate >= :fromDate', {
  //       fromDate: filters.fromDate,
  //     });
  //   }
  //   if (filters?.toDate) {
  //     query.andWhere('invoice.invoiceDate <= :toDate', {
  //       toDate: filters.toDate,
  //     });
  //   }
  //
  //   const schemas = await query
  //     .orderBy('invoice.invoiceDate', 'DESC')
  //     .getMany();
  //   return schemas.map((s) => this.toDomain(s));
  // }
  async findAll(filters?: InvoiceFilters): Promise<Invoice[]> {
    // Add .leftJoinAndSelect to join the client table
    const query = this.repo
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.client', 'client');

    if (filters?.clientId) {
      query.andWhere('invoice.clientId = :clientId', {
        clientId: filters.clientId,
      });
    }
    if (filters?.status) {
      query.andWhere('invoice.status = :status', { status: filters.status });
    }
    if (filters?.fromDate) {
      query.andWhere('invoice.invoiceDate >= :fromDate', {
        fromDate: filters.fromDate,
      });
    }
    if (filters?.toDate) {
      query.andWhere('invoice.invoiceDate <= :toDate', {
        toDate: filters.toDate,
      });
    }

    const schemas = await query
      .orderBy('invoice.invoiceDate', 'DESC')
      .getMany();

    return schemas.map((s) => this.toDomain(s));
  }

  async findAllPaginated(
    skip: number,
    limit: number,
  ): Promise<[Invoice[], number]> {
    const [schema, total] = await this.repo.findAndCount({
      where: { deletedAt: IsNull() },
      skip,
      take: limit,
    });
    return [schema.map((s) => this.toDomain(s)), total];
  }
  async update(id: string, invoice: Invoice): Promise<Invoice | null> {
    const data = invoice.toObject();
    await this.repo.update(id, data);
    const saved = await this.findById(id);

    if (!saved) {
      return null;
    }

    const result = this.toDomain(saved);

    if (Array.isArray(result)) {
      return result[0];
    }
    return result;
  }

  async existsForPeriod(
    clientId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<boolean> {
    const count = await this.repo.count({
      where: {
        clientId,
        billingPeriodStart: periodStart,
        billingPeriodEnd: periodEnd,
        status: Not(InvoiceStatus.CANCELLED),
      },
    });
    return count > 0;
  }

  async findAllDueForGeneration(): Promise<string[]> {
    // Find all active clients whose billing date is today
    // This would typically join with Client table
    // For now, return distinct clientIds with no invoice this month

    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const result = await this.repo
      .createQueryBuilder('invoice')
      .select('DISTINCT invoice.clientId', 'clientId')
      .where('invoice.invoiceDate BETWEEN :start AND :end', {
        start: firstOfMonth,
        end: lastOfMonth,
      })
      .getRawMany();

    const invoicedClientIds = result.map((r) => r.clientId);

    // Return all clients NOT in this list (needs Client repository)
    // For now, return empty array - implement with Client repository
    return [];
  }

  // private toDomain(schema: InvoiceSchema): Invoice {
  //   return Invoice.createFromPersistence({
  //     id: schema.id,
  //     invoiceNumber: schema.invoiceNumber,
  //     clientId: schema.clientId,
  //     billingPeriodStart: new Date(schema.billingPeriodStart),
  //     billingPeriodEnd: new Date(schema.billingPeriodEnd),
  //     invoiceDate: schema.invoiceDate,
  //     dueDate: schema.dueDate,
  //     activeUnits: schema.activeUnits,
  //     unitPrice: schema.unitPrice,
  //     subtotal: schema.subtotal,
  //     creditApplied: schema.creditApplied,
  //     totalAmount: schema.totalAmount,
  //     amountPaid: schema.amountPaid,
  //     balance: schema.balance,
  //     status: schema.status,
  //     notes: schema.notes,
  //     createdBy: schema.createdBy,
  //     createdAt: new Date(schema.createdAt),
  //     updatedAt: new Date(schema.updatedAt),
  //   });
  // }
  private toDomain(schema: InvoiceSchema): Invoice {
    const invoice = Invoice.createFromPersistence({
      id: schema.id,
      invoiceNumber: schema.invoiceNumber,
      clientId: schema.clientId,
      billingPeriodStart: new Date(schema.billingPeriodStart),
      billingPeriodEnd: new Date(schema.billingPeriodEnd),
      invoiceDate: new Date(schema.invoiceDate),
      dueDate: new Date(schema.dueDate),
      activeUnits: Number(schema.activeUnits),
      unitPrice: Number(schema.unitPrice),
      subtotal: Number(schema.subtotal),
      creditApplied: Number(schema.creditApplied),
      totalAmount: Number(schema.totalAmount),
      amountPaid: Number(schema.amountPaid),
      balance: Number(schema.balance),
      status: schema.status,
      notes: schema.notes,
      createdBy: schema.createdBy,
      createdAt: new Date(schema.createdAt),
      updatedAt: new Date(schema.updatedAt),
    });

    // ADD THESE LINES HERE:
    if (schema.client) {
      invoice.setClient(schema.client);
    }

    return invoice;
  }
}
