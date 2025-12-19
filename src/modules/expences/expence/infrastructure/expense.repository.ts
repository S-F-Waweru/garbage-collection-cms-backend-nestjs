import { IExpenseRepository } from '../domain/expense.repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpenseSchema } from './expense.schema';
import { Repository } from 'typeorm';
import { Expense } from '../domain/expense.entity';

export class ExpenseRepository implements IExpenseRepository {
  constructor(
    @InjectRepository(ExpenseSchema)
    private readonly repository: Repository<ExpenseSchema>,
  ) {}

  async findByPettyCashId(pettyCashId: string) {
    const schemas = await this.repository.find({
      where: {
        pettyCash: {
          id: pettyCashId, // Filters expenses by the linked PettyCash ID
        },
      },
      order: {
        expenseDate: 'DESC', // Usually helpful to see newest expenses first
      },
    });

    return schemas.map((s) => this.toDomain(s));
  }


  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  async findAll(): Promise<Expense[]> {
    const schemas = await this.repository.find();
    return schemas.map((s) => this.toDomain(s));
  }

  async findById(id: string): Promise<Expense | null> {
    const schema = await this.repository.findOne({ where: { id } });
    return schema ? this.toDomain(schema) : null;
  }

  async findAllPaginated(
    skip: number,
    limit: number,
  ): Promise<[Expense[], number]> {
    const [schemas, total] = await this.repository.findAndCount({
      skip,
      take: limit,
    });
    return [schemas.map((s) => this.toDomain(s)), total];
  }

  async save(expense: Expense): Promise<Expense> {
    const schema = this.toSchema(expense);
    const saved = await this.repository.save(schema);
    return this.toDomain(saved);
  }

  private toSchema(expense: Expense): Partial<ExpenseSchema> {
    return {
      id: expense.id,
      amount: expense.amount,
      description: expense.description,
      expenseDate: expense.expenseDate,
      category: expense.category,
      notes: expense.notes,
      pettyCash: expense.pettyCash,
      recordedBy: expense.recordedBy,
    };
  }

  private toDomain(schema: ExpenseSchema): Expense {
    return Expense.fromPersistence({
      id: schema.id,
      amount: schema.amount,
      description: schema.description,
      expenseDate: schema.expenseDate,
      notes: schema.notes,
      pettyCash: schema.pettyCash,
      category: schema.category,
      recordedBy: schema.recordedBy,
    });
  }
}
