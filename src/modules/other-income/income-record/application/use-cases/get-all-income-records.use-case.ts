import { Inject, Injectable } from '@nestjs/common';

import { IncomeRecord } from '../../domain/income-record.entity';
import { IIncomeRecordRepository } from '../../domain/interface/income-record.repository.interface';

@Injectable()
export class GetAllIncomeRecordsUseCase {
  constructor(
    @Inject(IIncomeRecordRepository)
    private readonly repository: IIncomeRecordRepository,
  ) {}

  async execute(): Promise<IncomeRecord[]> {
    return this.repository.findAll();
  }
}
