import { Module } from '@nestjs/common';
import { CreatePettyCashUseCase } from './application/use-cases/create-petty-cash.use-case';
import { UpdatePettyCashUseCase } from './application/use-cases/update.petty-cash.use-case';
import { FindAllPettyCashUseCase } from './application/use-cases/find-all-petty-cash.use-case';
import { FindPettyCashByIdUseCase } from './application/use-cases/find-petty-cash-by-id.use-case';
import { DeletePettyCashUseCase } from './application/use-cases/delete-petty-cash.use-case';
import { PettyCashRepository } from './infrastructure/petty-cash.repository';
import { IPettyCashRepository } from './domain/interfaces/petty-cash.repository.interface';
import { PettyCashController } from './presentation/petty-cash.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PettyCashSchema } from './infrastructure/petty-cash-schema';
import { IExpenseRepository } from '../expence/domain/expense.repository.interface';
import { ExpenseRepository } from '../expence/infrastructure/expense.repository';
import { ExpenseSchema } from '../expence/infrastructure/expense.schema';

@Module({
  imports: [TypeOrmModule.forFeature([PettyCashSchema, ExpenseSchema])],
  controllers: [PettyCashController],
  providers: [
    CreatePettyCashUseCase,
    UpdatePettyCashUseCase,
    FindAllPettyCashUseCase,
    FindPettyCashByIdUseCase,
    DeletePettyCashUseCase,
    {
      provide: IPettyCashRepository,
      useClass: PettyCashRepository,
    },
    {
      provide: IExpenseRepository,
      useClass: ExpenseRepository,
    },
  ],
  exports: [IPettyCashRepository],
})
export class PettyCashModule {}
