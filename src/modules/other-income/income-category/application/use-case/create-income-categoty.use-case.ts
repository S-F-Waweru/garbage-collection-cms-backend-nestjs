import { Inject, Injectable } from '@nestjs/common';
import { IIncomeCategoryRepository } from '../../domain/interfaces/income-category.repository.interface';

import { BadRequestException } from '@nestjs/common';
import { CreateIncomeCategoryDto } from '../dto/Income-category.dto';
import { IncomeCategory } from '../../domain/income-category.entity';

@Injectable()
export class CreateIncomeCategoryUseCase {
  constructor(
    @Inject(IIncomeCategoryRepository)
    private readonly incomeCategoryRepository: IIncomeCategoryRepository,
  ) {}

  async execute(dto: CreateIncomeCategoryDto) {
    // 1. Check if a category with the same name exists
    const exists = await this.incomeCategoryRepository.exists(dto.name);
    if (exists) {
      throw new BadRequestException(
        `Income category with name "${dto.name}" already exists`,
      );
    }

    // 2. Create domain entity (performs validation internally)
    const category = IncomeCategory.create({
      name: dto.name,
      description: dto.description,
    });

    // 3. Persist via repository
    const savedCategory = await this.incomeCategoryRepository.save(category);

    // 4. Return saved domain entity
    return {
      id: savedCategory.id,
      name: savedCategory.name,
      description: savedCategory.description,
      message: 'Income category created successfully',
    };
  }
}
