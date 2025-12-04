import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateIncomeRecordDto } from '../dto/income-record.dto';
import { IncomeRecord } from '../../domain/income-record.entity';
import { IIncomeRecordRepository } from '../../domain/interface/income-record.repository.interface';
import { IncomeCategory } from '../../../income-category/domain/income-category.entity';
import { IIncomeCategoryRepository } from '../../../income-category/domain/interfaces/income-category.repository.interface';

@Injectable()
export class UpdateIncomeRecordUseCase {
  constructor(
    @Inject(IIncomeRecordRepository)
    private readonly repository: IIncomeRecordRepository,
    @Inject(IIncomeCategoryRepository)
    private readonly categoryRepository: IIncomeCategoryRepository,
  ) {}

  async execute(
    data: UpdateIncomeRecordDto & { id: string },
  ): Promise<IncomeRecord> {
    const existing = await this.repository.findById(data.id);

    if (!existing) throw new NotFoundException('Income record not found');

    let category: IncomeCategory | null = null;
    if (data.categoryId) {
      category = await this.categoryRepository.findById(data.categoryId);
      if (!category) {
        throw new NotFoundException('Income category not found');
      }
    }

    existing.update({
      clientName: data.clientName,
      unitPrice: data.unitPrice,
      unitCount: data.unitCount,
      unitType: data.unitType,
      notes: data.notes,
    });

    await this.repository.update(existing);

    return existing;
  }
}
