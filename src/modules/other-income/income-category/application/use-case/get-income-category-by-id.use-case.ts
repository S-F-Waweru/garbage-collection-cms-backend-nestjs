import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IIncomeCategoryRepository } from '../../domain/interfaces/income-category.repository.interface';

@Injectable()
export class GetIncomeCategoryByIdUseCase {
  constructor(
    @Inject(IIncomeCategoryRepository)
    private readonly incomeCategoryRepository: IIncomeCategoryRepository,
  ) {}

  async execute(id: string) {
    const category = await this.incomeCategoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Income category with ID "${id}" not found`);
    }

    return {
      id: category.id,
      name: category.name,
      description: category.description,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      message: 'Income category retrieved successfully',
    };
  }
}
