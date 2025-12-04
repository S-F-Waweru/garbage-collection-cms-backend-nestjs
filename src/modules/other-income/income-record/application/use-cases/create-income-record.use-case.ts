import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CreateIncomeRecordDto } from '../dto/income-record.dto';
import { IncomeRecord } from '../../domain/income-record.entity';
import { IIncomeRecordRepository } from '../../domain/interface/income-record.repository.interface';
import { IIncomeCategoryRepository } from '../../../income-category/domain/interfaces/income-category.repository.interface';

@Injectable()
export class CreateIncomeRecordUseCase {
  constructor(
    @Inject(IIncomeRecordRepository)
    private readonly repository: IIncomeRecordRepository,
    @Inject(IIncomeCategoryRepository)
    private readonly categoryRepository: IIncomeCategoryRepository,
  ) {}

  async execute(dto: CreateIncomeRecordDto) {
    const category = await this.categoryRepository.findById(dto.categoryId);
    if (category === null) {
      throw new BadRequestException(`Category ${dto.categoryId} not found`);
    }
    const incomeRecord = IncomeRecord.create({
      category: category,
      clientName: dto.clientName,
      unitPrice: dto.unitPrice,
      unitCount: dto.unitCount,
      unitType: dto.unitType,
      recordedBy: dto.recordedBy,
      notes: dto.notes,
    });

    await this.repository.save(incomeRecord);

    return {
      id: incomeRecord.id,
      message: 'Income record created successfully',
    };
  }
}
