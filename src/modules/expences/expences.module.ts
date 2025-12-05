import { Module } from '@nestjs/common';
import { PettyCashModule } from './petty-cash/petty-cash.module';
import { ExpenceModule } from './expence/expence.module';
import { ExpenseCategoryModule } from './expense-category/expense-category.module';

@Module({
  imports: [PettyCashModule, ExpenceModule, ExpenseCategoryModule]
})
export class ExpencesModule {}
