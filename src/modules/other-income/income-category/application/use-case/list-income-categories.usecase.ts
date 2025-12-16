import { Inject, Injectable } from '@nestjs/common';
import { IIncomeCategoryRepository } from '../../domain/interfaces/income-category.repository.interface';
import { ListIncomeCategoriesDto } from '../dto/Income-category.dto';
import { IncomeCategory } from '../../domain/income-category.entity';
import { PaginationParams } from '../../../../clients/client/application/use-cases/find-all-pagiantion.use-case';

@Injectable()
export class ListIncomeCategoriesUseCase {
  constructor(
    @Inject(IIncomeCategoryRepository)
    private readonly incomeCategoryRepository: IIncomeCategoryRepository,
  ) {}

  async execute(params: PaginationParams) {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [incomeCategories, total] =
      await this.incomeCategoryRepository.findAllPaginated(skip, limit);

    return {
      data: incomeCategories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
