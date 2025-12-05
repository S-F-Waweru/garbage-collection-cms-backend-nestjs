import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseSchema } from './infrastructure/expense.schema';
import { ExpensesController } from '../../location/presentation/expenses.controller';
import { CreateExpenseUseCase } from './application/use-cases/Create-expense.use-case';
import { DeleteExpenseUseCase } from './application/use-cases/deleteExpense.use-case';
import { UpdateExpenseUseCase } from './application/use-cases/update-expense.use-case';
import { FindExpenseByIdUsecase } from './application/use-cases/find-expense-by-id.usecase';
import { FindAllPettyCashUseCase } from '../petty-cash/application/use-cases/find-all-petty-cash.use-case';
import { IExpenseRepository } from './domain/expense.repository.interface';
import { ExpenseRepository } from './infrastructure/expense.repository';
import { FindAllExpensesUseCase } from './application/use-cases/find-all-expenses.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([ExpenseSchema])],
  controllers: [ExpensesController],
  providers: [
    CreateExpenseUseCase,
    DeleteExpenseUseCase,
    UpdateExpenseUseCase,
    FindExpenseByIdUsecase,
    FindAllExpensesUseCase,
    {
      provide: IExpenseRepository,
      useClass: ExpenseRepository,
    },
  ],
  exports: [IExpenseRepository],
})
export class ExpenceModule {}
