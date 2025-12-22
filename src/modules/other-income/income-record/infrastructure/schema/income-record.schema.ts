import { IncomeCategorySchema } from "src/modules/other-income/income-category/infrastructure/schema/IncomeCategory.schema";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";
import { Unit } from "../../application/dto/income-record.dto";

@Entity('income_records')
export class IncomeRecordSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  categoryId: string;

  @ManyToOne(() => IncomeCategorySchema, { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: IncomeCategorySchema;

  @Column()
  clientName: string;

  @Column('decimal', { nullable: false })
  unitPrice: number;

  @Column('decimal', { nullable: false })
  unitCount: number;

  @Column({ type: 'enum', enum: Unit, nullable: false })
  unitType: Unit;

  @Column({ nullable: true })
  notes?: string;

  @Column()
  recordedBy: string;

  @Column({ type: 'timestamp', nullable: false })
  recordedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
