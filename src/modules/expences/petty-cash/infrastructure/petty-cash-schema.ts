import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../auth/domain/entities/user.entity';
import { IncomeSource } from '../application/dto/petty-cash.dto';

@Entity('petty_cashes')
export class PettyCashSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column()
  createdBy: string;

  @Column({
    type: 'enum',
    enum: IncomeSource,
    default: IncomeSource.BANK, // Or any other default from your enum
  })
  incomeSource: IncomeSource;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
