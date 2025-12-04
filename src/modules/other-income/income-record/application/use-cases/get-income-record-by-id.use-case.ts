import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { IIncomeRecordRepository } from '../../domain/interface/income-record.repository.interface';

@Injectable()
export class DeleteIncomeRecordUseCase {
  constructor(
    @Inject(IIncomeRecordRepository)
    private readonly repository: IIncomeRecordRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const exists = await this.repository.exists(id);

    if (!exists) throw new NotFoundException('Income record not found');

    await this.repository.delete(id);
  }
}
