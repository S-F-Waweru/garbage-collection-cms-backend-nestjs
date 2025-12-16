import { Inject, Injectable } from '@nestjs/common';
import { IExpenseRepository } from '../../domain/expense.repository.interface';
import { PaginationParams } from '../../../../clients/client/application/use-cases/find-all-pagiantion.use-case';

@Injectable()
export class FindAllPaginatedExpensesUseCase {
  constructor(
    @Inject(IExpenseRepository) private expenseRepository: IExpenseRepository,
  ) {}

  async execute(params: PaginationParams) {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [expences, total] = await this.expenseRepository.findAllPaginated(
      skip,
      limit,
    );

    return {
      data: expences,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
