// infrastructure/payment.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  IPaymentRepository,
  PaymentFilters,
} from '../domain/payment.repository.interface';
import { Payment } from '../domain/payment.entity';
import { PaymentSchema } from './payment.schema';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(
    @InjectRepository(PaymentSchema)
    private readonly repo: Repository<PaymentSchema>,
    private readonly dataSource: DataSource,
  ) {}

  async getNextPaymentNumber(): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const result = await queryRunner.query(
        `SELECT nextval('payment_number_seq') as next_number`,
      );

      const sequenceNumber = result[0].next_number;
      const year = new Date().getFullYear();

      return `PAY-${year}-${String(sequenceNumber).padStart(4, '0')}`;
    } finally {
      await queryRunner.release();
    }
  }

  async save(payment: Payment): Promise<Payment> {
    const data = payment.toObject();
    const schema = this.repo.create(data);
    const saved = await this.repo.save(schema);
    // todo check the errror here
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Payment | null> {
    const schema = await this.repo.findOne({ where: { id } });
    return schema ? this.toDomain(schema) : null;
  }

  async findByPaymentNumber(paymentNumber: string): Promise<Payment | null> {
    const schema = await this.repo.findOne({ where: { paymentNumber } });
    return schema ? this.toDomain(schema) : null;
  }

  async findByClient(clientId: string): Promise<Payment[]> {
    const schemas = await this.repo.find({
      where: { clientId },
      order: { paymentDate: 'DESC' },
    });
    return schemas.map((s) => this.toDomain(s));
  }

  async findAll(filters?: PaymentFilters): Promise<Payment[]> {
    const query = this.repo.createQueryBuilder('payment');

    if (filters?.clientId) {
      query.andWhere('payment.clientId = :clientId', {
        clientId: filters.clientId,
      });
    }

    if (filters?.paymentMethod) {
      query.andWhere('payment.paymentMethod = :method', {
        method: filters.paymentMethod,
      });
    }

    if (filters?.startDate) {
      query.andWhere('payment.paymentDate >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      query.andWhere('payment.paymentDate <= :endDate', {
        endDate: filters.endDate,
      });
    }

    const schemas = await query
      .orderBy('payment.paymentDate', 'DESC')
      .getMany();
    return schemas.map((s) => this.toDomain(s));
  }

  async update(id: string, payment: Payment): Promise<Payment | null> {
    const data = payment.toObject();
    await this.repo.update(id, data);
    const updatedPayment = await this.findById(id);
    return updatedPayment ? updatedPayment : null;
  }

  private toDomain(schema: PaymentSchema): Payment {
    return Payment.createFromPersistence({
      id: schema.id,
      paymentNumber: schema.paymentNumber,
      clientId: schema.clientId,
      amount: parseFloat(schema.amount.toString()),
      paymentMethod: schema.paymentMethod,
      paymentDate: schema.paymentDate,
      referenceNumber: schema.referenceNumber,
      notes: schema.notes,
      createdBy: schema.createdBy,
      appliedToInvoices: schema.appliedToInvoices || [],
      excessAmount: parseFloat(schema.excessAmount.toString()),
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    });
  }
}
