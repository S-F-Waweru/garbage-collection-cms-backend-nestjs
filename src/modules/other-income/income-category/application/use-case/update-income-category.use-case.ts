import { IIncomeCategoryRepository } from '../../domain/interfaces/income-category.repository.interface';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateIncomeCategoryDto } from '../dto/Income-category.dto';

@Injectable()
export class UpdateIncomeCategoryUseCase {
  constructor(
    @Inject(IIncomeCategoryRepository)
    private readonly incomeCategoryRepository: IIncomeCategoryRepository,
  ) {}

  async execute(id: string, dto: UpdateIncomeCategoryDto) {
    // 1. Fetch the existing category
    const category = await this.incomeCategoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Income category with ID "${id}" not found`);
    }

    // 2. Optional: check for duplicate name if name is being updated
    if (dto.name && dto.name !== category.name) {
      const exists = await this.incomeCategoryRepository.exists(dto.name);
      if (exists) {
        throw new BadRequestException(
          `Income category with name "${dto.name}" already exists`,
        );
      }
    }

    category.updateDetails(dto.name, dto.description);

    // 4. Persist the changes
    const savedCategory = await this.incomeCategoryRepository.update(category);

    // 5. Return updated entity
    return {
      id: savedCategory.id,
      name: savedCategory.name,
      description: savedCategory.description,
      message: 'Income category created successfully',
    };
  }
}
