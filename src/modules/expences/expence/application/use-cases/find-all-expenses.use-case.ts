import { Inject, Injectable } from '@nestjs/common';
import { IExpenseRepository } from '../../domain/expense.repository.interface';

@Injectable()
export class FindAllExpensesUseCase {
  constructor(
    @Inject(IExpenseRepository) private expenseRepository: IExpenseRepository,
  ) {}

  async execute() {
    const expenses = await this.expenseRepository.findAll();
    if (expenses) {
      return expenses;
    }

    return [];
  }
}
