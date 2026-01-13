// infrastructure/payment.schema.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
} from 'typeorm';
import { PaymentMethod } from '../domain/payment.entity';
import { InvoiceSchema } from '../../invoices/infrasctructure/invoice.schema';

@Entity('payments')
@Index(['clientId', 'paymentDate'])
@Index(['paymentMethod'])
export class PaymentSchema {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  paymentNumber: string;

  @Column('uuid')
  clientId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column('date')
  paymentDate: Date;

  @Column({ nullable: true })
  referenceNumber?: string;

  @Column('text', { nullable: true })
  notes?: string;

  @Column('uuid')
  createdBy: string;

  @Column('jsonb', { default: [] })
  appliedToInvoices: any[];

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  excessAmount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => InvoiceSchema, (invoice) => invoice.payments)
  invoice: InvoiceSchema;
}
