import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';

@Entity('income_categories')
export class IncomeCategorySchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('IDX_INCOME_CATEGORY_NAME', ['name'], { unique: true })
  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;
}
