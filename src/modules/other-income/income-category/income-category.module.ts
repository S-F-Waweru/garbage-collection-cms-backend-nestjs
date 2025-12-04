import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateIncomeCategoryUseCase } from './application/use-case/create-income-categoty.use-case';
import { IIncomeCategoryRepository } from './domain/interfaces/income-category.repository.interface';
import { IncomeCategorySchema } from './infrastructure/schema/IncomeCategory.schema';
import { IncomeCategoryController } from './presentation/Income-category.controller';
import { IncomeCategoryRepository } from './infrastructure/repository/income-category.repository';
import { UpdateIncomeCategoryUseCase } from './application/use-case/update-income-category.use-case';
import { DeleteIncomeCategoryUseCase } from './application/use-case/delete-category-income.use-case';
import { GetIncomeCategoryByIdUseCase } from './application/use-case/get-income-category-by-id.use-case';
import { ListIncomeCategoriesUseCase } from './application/use-case/list-income-categories.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([IncomeCategorySchema])],
  controllers: [IncomeCategoryController],
  providers: [
    // Repository binding to interface
    { provide: IIncomeCategoryRepository, useClass: IncomeCategoryRepository },

    // Use cases
    CreateIncomeCategoryUseCase,
    UpdateIncomeCategoryUseCase,
    DeleteIncomeCategoryUseCase,
    GetIncomeCategoryByIdUseCase,
    ListIncomeCategoriesUseCase,
  ],
})
export class IncomeCategoryModule {}
