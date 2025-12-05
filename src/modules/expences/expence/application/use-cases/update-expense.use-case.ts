import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IExpenseRepository } from '../../domain/expense.repository.interface';
import { UpdateExpenseDto } from '../expense..dto';
import { IPettyCashRepository } from '../../../petty-cash/domain/interfaces/petty-cash.repository.interface';

@Injectable()
export class UpdateExpenseUseCase {
  constructor(
    @Inject(IExpenseRepository) private expenseRepository: IExpenseRepository,
    @Inject(IPettyCashRepository)
    private pettyCashRepository: IPettyCashRepository,
  ) {}

  async execute(id: string, dto: UpdateExpenseDto) {
    const existingExpense = await this.expenseRepository.findById(id);
    const pettyCash = await this.pettyCashRepository.findById(dto.pettyCashId);
    if (!pettyCash) {
      throw new NotFoundException('Petty Cash not found');
    }
    if (!existingExpense) {
      throw new NotFoundException('Expense not found');
    }

    existingExpense.update({
      pettyCash: pettyCash,
      description: dto.description,
      amount: dto.amount,
      expenseDate: dto.expenseDate,
      recordedBy: dto.recordedBy,
      category: dto.category,
      notes: dto.notes,
    });

    this.expenseRepository.save(existingExpense);

    return {
      id: existingExpense.id,
      message: 'Expense updated successfully',
    };
  }
}
