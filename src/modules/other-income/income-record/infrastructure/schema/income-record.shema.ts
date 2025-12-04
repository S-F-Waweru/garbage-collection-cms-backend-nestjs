import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { IncomeCategorySchema } from '../../../income-category/infrastructure/schema/IncomeCategory.schema';
import { Unit } from '../../application/dto/income-record.dto';

@Entity('income_records')
export class IncomeRecordSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => IncomeCategorySchema, { eager: true })
  category: IncomeCategorySchema;

  @Column()
  clientName: string;

  @Column('decimal')
  unitPrice: number;

  @Column('decimal')
  unitCount: number;

  @Column({ type: 'enum', enum: Unit })
  unitType: Unit;

  @Column({ nullable: true })
  notes?: string;

  @Column()
  recordedBy: string; // userId

  @Column({ type: 'timestamp' })
  recordedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
