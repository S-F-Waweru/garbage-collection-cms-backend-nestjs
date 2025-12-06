import { PettyCash } from '../../petty-cash/domain/petty-cash.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PettyCashSchema } from '../../petty-cash/infrastructure/petty-cash-schema';

@Entity('expenses')
export class ExpenseSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PettyCashSchema, { eager: true })
  pettyCash: PettyCash;

  @Column()
  category: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  notes: string;

  @Column({ type: 'date' })
  expenseDate: Date;

  @Column()
  recordedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
