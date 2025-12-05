import { IExpenseRepository } from '../../domain/expense.repository.interface';
import { CreateExpenseDto } from '../expense..dto';
import { IPettyCashRepository } from '../../../petty-cash/domain/interfaces/petty-cash.repository.interface';
import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Expense } from '../../domain/expense.entity';

@Injectable()
export class CreateExpenseUseCase {
  constructor(
    @Inject(IExpenseRepository)
    private readonly expenseRepository: IExpenseRepository,

    @Inject(IPettyCashRepository)
    private readonly pettyCashRepository: IPettyCashRepository,
  ) {}

  async execute(id: string, dto: CreateExpenseDto) {
    const pettyCash = await this.pettyCashRepository.findById(dto.pettyCashId);

    if (!pettyCash) {
      throw new NotFoundException('Petty cash not Found');
    }

    const expense = Expense.create({
      pettyCash: pettyCash,
      description: dto.description,
      amount: dto.amount,
      expenseDate: dto.expenseDate,
      recordedBy: id,
      category: dto.category,
      notes: dto.notes,
    });

    const createdExpense = await this.expenseRepository.save(expense);

    return {
      id: createdExpense.id,
      message: 'Expense created successfully',
    };
  }
}
