import { Inject, Injectable } from '@nestjs/common';
import { IIncomeCategoryRepository } from '../../domain/interfaces/income-category.repository.interface';
import { ListIncomeCategoriesDto } from '../dto/Income-category.dto';
import { IncomeCategory } from '../../domain/income-category.entity';

@Injectable()
export class ListIncomeCategoriesUseCase {
  constructor(
    @Inject(IIncomeCategoryRepository)
    private readonly incomeCategoryRepository: IIncomeCategoryRepository,
  ) {}

  async execute(query: ListIncomeCategoriesDto): Promise<IncomeCategory[]> {
    // Fetch categories via repository
    const categories = await this.incomeCategoryRepository.findAll();
    return categories;
  }
}
