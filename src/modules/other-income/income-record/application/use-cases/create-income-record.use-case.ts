import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

import { CreateIncomeRecordDto } from '../dto/income-record.dto';
import { IncomeRecord } from '../../domain/income-record.entity';
import { IIncomeRecordRepository } from '../../domain/interface/income-record.repository.interface';
import { IIncomeCategoryRepository } from '../../../income-category/domain/interfaces/income-category.repository.interface';

@Injectable()
export class CreateIncomeRecordUseCase {
  logger = new Logger(CreateIncomeRecordDto.name);
  constructor(
    @Inject(IIncomeRecordRepository)
    private readonly repository: IIncomeRecordRepository,
    @Inject(IIncomeCategoryRepository)
    private readonly categoryRepository: IIncomeCategoryRepository,
  ) {}

  async execute(userId: string, dto: CreateIncomeRecordDto) {
    const category = await this.categoryRepository.findById(dto.categoryId);
    if (category === null) {
      throw new BadRequestException(`Category ${dto.categoryId} not found`);
    }
    const incomeRecord = IncomeRecord.create({
      category: category, // still keep relation for ORM
      clientName: dto.clientName,
      unitPrice: Number(dto.unitPrice), // ensure it’s a number
      unitCount: Number(dto.unitCount), // ensure it’s a number
      unitType: dto.unitType,
      recordedBy: userId,
      notes: dto.notes,
    });

    this.logger.debug(incomeRecord);

    await this.repository.save(incomeRecord);

    return {
      id: incomeRecord.id,
      message: 'Income record created successfully',
    };
  }
}
