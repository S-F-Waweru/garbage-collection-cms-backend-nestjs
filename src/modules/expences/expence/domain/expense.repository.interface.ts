import { Expense } from './expense.entity';

export interface IExpenseRepository {
  save(expense: Expense): Promise<Expense>;
  findById(id: string): Promise<Expense | null>;
  findByPettyCashId(id: string): Promise<Expense[]>;
  findAll(): Promise<Expense[]>;
  findAllPaginated(skip: number, limit: number): Promise<[Expense[], number]>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  getMonthlyTotals(year: number): Promise<number[]>;
}

export const IExpenseRepository = Symbol('IExpenseRepository');
