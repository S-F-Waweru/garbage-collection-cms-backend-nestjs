import { IncomeCategory } from '../income-category.entity';

export interface IIncomeCategoryRepository {
  findById(id: string): Promise<IncomeCategory | null>;
  findByName(name: string): Promise<IncomeCategory | null>;
  findAll(): Promise<IncomeCategory[]>;
  findAllPaginated(
    skip: number,
    limit: number,
  ): Promise<[IncomeCategory[], number]>;
  save(category: IncomeCategory): Promise<IncomeCategory>;
  exists(name: string): Promise<boolean>;
  update(category: IncomeCategory): Promise<IncomeCategory>;
  delete(id: string): Promise<void>;
}

export const IIncomeCategoryRepository = Symbol('IIncomeCategoryRepository');
