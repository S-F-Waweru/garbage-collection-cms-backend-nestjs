import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IIncomeCategoryRepository } from '../../domain/interfaces/income-category.repository.interface';
import { IIncomeRecordRepository } from 'src/modules/other-income/income-record/domain/interface/income-record.repository.interface';

@Injectable()
export class GetIncomeCategoryByIdUseCase {
  constructor(
    @Inject(IIncomeCategoryRepository)
    private readonly incomeCategoryRepository: IIncomeCategoryRepository,
    @Inject(IIncomeRecordRepository)
    private readonly incomeRecordRepository: IIncomeRecordRepository,
  ) {}

  async execute(id: string) {
    const category = await this.incomeCategoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Income category with ID "${id}" not found`);
    }

    const records = await this.incomeRecordRepository.findByCategory(id);

    return {
      id: category.id,
      name: category.name,
      description: category.description,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      records,
      message: 'Income category retrieved successfully',
    };
  }
}
