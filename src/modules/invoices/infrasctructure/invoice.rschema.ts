// infrastructure/invoice.schema.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { InvoiceStatus } from '../domain/invoice.entity';
import { ClientSchema } from '../../clients/client/infrastructure/perisistence/schema/client.schema';
import { PaymentSchema } from '../../payments/infrastructure/payment.schema';
import { UserSchema } from '../../auth/infrastructure/persistence/schema/user.schema';

@Entity('invoices')
@Index(['clientId', 'invoiceDate'])
@Index(['status'])
@Index(['dueDate'])
export class InvoiceSchema {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  invoiceNumber: string;

  @Column('uuid')
  clientId: string;

  @Column('date')
  billingPeriodStart: Date;

  @Column('date')
  billingPeriodEnd: Date;

  @Column('date')
  invoiceDate: Date;

  @Column('date')
  dueDate: Date;

  @Column('int')
  activeUnits: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  creditApplied: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  amountPaid: number;

  @Column('decimal', { precision: 10, scale: 2 })
  balance: number;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.PENDING,
  })
  status: InvoiceStatus;

  @Column('text', { nullable: true })
  notes?: string;

  @Column('uuid')
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Relationships (optional - for joins)
  @ManyToOne(() => ClientSchema)
  @JoinColumn({ name: 'clientId' })
  client?: ClientSchema;

  @OneToMany(() => PaymentSchema, (payment) => payment.invoice)
  payments?: PaymentSchema[];

  @ManyToOne(() => UserSchema)
  @JoinColumn({ name: 'createdBy' })
  creator?: UserSchema;
}
