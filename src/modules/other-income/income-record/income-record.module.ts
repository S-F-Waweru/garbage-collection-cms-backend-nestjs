import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeRecord } from './domain/income-record.entity';

import { IncomeCategoryModule } from '../income-category/income-category.module';
import { CreateIncomeRecordUseCase } from './application/use-cases/create-income-record.use-case';
import { IncomeRecordController } from './presentation/income-record.controller';
import { IIncomeRecordRepository } from './domain/interface/income-record.repository.interface';
import { IncomeRecordRepository } from './infrastructure/schema/repository/income-record.repository';
import { GetAllIncomeRecordsUseCase } from './application/use-cases/get-all-income-records.use-case';
import { GetIncomeCategoryByIdUseCase } from '../income-category/application/use-case/get-income-category-by-id.use-case';
import { DeleteIncomeRecordUseCase } from './application/use-cases/get-income-record-by-id.use-case';
import { UpdateIncomeRecordUseCase } from './application/use-cases/update-income-record.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([IncomeRecord]), IncomeCategoryModule],
  controllers: [IncomeRecordController],
  providers: [
    {
      provide: IIncomeRecordRepository,
      useClass: IncomeRecordRepository,
    },
    CreateIncomeRecordUseCase,
    UpdateIncomeRecordUseCase,
    DeleteIncomeRecordUseCase,
    GetAllIncomeRecordsUseCase,
    GetIncomeCategoryByIdUseCase,
  ],
  exports: [IIncomeRecordRepository],
})
export class IncomeRecordModule {}
