import { IncomeRecord } from '../income-record.entity';

export interface IIncomeRecordRepository {
  findById(id: string): Promise<IncomeRecord | null>;
  findAll(): Promise<IncomeRecord[]>;

  findByCategory(categoryId: string): Promise<IncomeRecord[]>;

  save(record: IncomeRecord): Promise<IncomeRecord>;
  update(record: IncomeRecord): Promise<IncomeRecord>;

  delete(id: string): Promise<void>; // soft delete
  exists(id: string): Promise<boolean>;
}

export const IIncomeRecordRepository = Symbol('IIncomeRecordRepository');
