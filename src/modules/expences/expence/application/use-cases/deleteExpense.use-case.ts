import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IExpenseRepository } from '../../domain/expense.repository.interface';

@Injectable()
export class DeleteExpenseUseCase {
  constructor(
    @Inject(IExpenseRepository) private expenseRepository: IExpenseRepository,
  ) {}

  async execute(id: string) {
    const existingExpense = await this.expenseRepository.findById(id);
    if (!existingExpense) {
      throw new NotFoundException('Expense not found');
    }

    await this.expenseRepository.delete(id);

    return {
      message: 'Expense deleted successfully',
    };
  }
}
