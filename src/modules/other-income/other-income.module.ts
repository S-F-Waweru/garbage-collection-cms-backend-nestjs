import { Module } from '@nestjs/common';
import { IncomeCategoryModule } from './income-category/income-category.module';
import { IncomeRecordModule } from './income-record/income-record.module';

@Module({
  imports: [IncomeCategoryModule, IncomeRecordModule],
})
export class OtherIncomeModule {}
