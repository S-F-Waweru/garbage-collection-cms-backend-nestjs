import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IPettyCashRepository } from '../../domain/interfaces/petty-cash.repository.interface';
import { read } from 'node:fs';
import { IExpenseRepository } from 'src/modules/expences/expence/domain/expense.repository.interface';

@Injectable()
export class FindPettyCashByIdUseCase {
  constructor(
    @Inject(IPettyCashRepository)
    private readonly pettyCashRepository: IPettyCashRepository,
    @Inject(IExpenseRepository)
    readonly expenseRepository: IExpenseRepository,
  ) {}

  async execute(id: string) {
    const pettyCash = await this.pettyCashRepository.findById(id);
    if (!pettyCash) {
      throw new NotFoundException('Petty cash record not found');
    }
    const expenses = await this.expenseRepository.findByPettyCashId(id);
  
    return {
      pettyCash,
      expenses,
    };
  }
}
