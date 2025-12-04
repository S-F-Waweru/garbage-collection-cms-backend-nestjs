import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IIncomeCategoryRepository } from '../../domain/interfaces/income-category.repository.interface';

@Injectable()
export class DeleteIncomeCategoryUseCase {
  constructor(
    @Inject(IIncomeCategoryRepository)
    private readonly incomeCategoryRepository: IIncomeCategoryRepository,
  ) {}

  async execute(id: string): Promise<void> {
    // 1. Check if category exists
    const category = await this.incomeCategoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Income category with ID "${id}" not found`);
    }

    // 2. Delete the category
    await this.incomeCategoryRepository.delete(id);

    return {
      message: 'Income category deleted successfully',
    };
  }
}
