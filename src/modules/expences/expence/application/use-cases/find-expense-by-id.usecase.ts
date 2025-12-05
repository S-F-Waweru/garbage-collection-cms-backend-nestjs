import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IExpenseRepository } from '../../domain/expense.repository.interface';

@Injectable()
export class FindExpenseByIdUsecase {
  constructor(
    @Inject(IExpenseRepository) private expenseRepository: IExpenseRepository,
  ) {}

  async execute(id: string) {
    const expense = await this.expenseRepository.findById(id);
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }
    return expense;
  }
}
