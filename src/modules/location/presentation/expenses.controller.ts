import { CreateExpenseUseCase } from '../../expences/expence/application/use-cases/Create-expense.use-case';
import { DeleteExpenseUseCase } from '../../expences/expence/application/use-cases/deleteExpense.use-case';
import { UpdateExpenseUseCase } from '../../expences/expence/application/use-cases/update-expense.use-case';
import { FindExpenseByIdUsecase } from '../../expences/expence/application/use-cases/find-expense-by-id.usecase';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  Body,
  Post,
  Delete,
  Put,
  Get,
  Param,
  Controller,
  UseGuards,
} from '@nestjs/common';
import {
  CreateExpenseDto,
  UpdateExpenseDto,
} from '../../expences/expence/application/expense..dto';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { FindAllExpensesUseCase } from '../../expences/expence/application/use-cases/find-all-expenses.use-case';

@Controller('expenses')
export class ExpensesController {
  constructor(
    private readonly createExpenseUseCase: CreateExpenseUseCase,
    private readonly deleteExpenseUseCase: DeleteExpenseUseCase,
    private readonly updateExpenseUseCase: UpdateExpenseUseCase,
    private readonly findExpenseBydUseCase: FindExpenseByIdUsecase,
    private readonly findAllExpensesUseCase: FindAllExpensesUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user, @Body() dto: CreateExpenseDto) {
    return this.createExpenseUseCase.execute(user.userId, dto);
  }

  @Put(':id')
  update(@Param('id') id, @Body() dto: UpdateExpenseDto) {
    return this.updateExpenseUseCase.execute(id, dto);
  }

  @Get()
  findAll() {
    return this.findAllExpensesUseCase.execute;
  }

  @Get(':id')
  findById(@Param('id') id) {
    return this.findAllExpensesUseCase.execute;
  }

  @Delete(':id')
  delete(@Param('id') id) {
    return this.deleteExpenseUseCase.execute(id);
  }
}
