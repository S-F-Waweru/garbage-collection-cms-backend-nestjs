import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';

import { CreateExpenseUseCase } from '../../expences/expence/application/use-cases/Create-expense.use-case';
import { DeleteExpenseUseCase } from '../../expences/expence/application/use-cases/deleteExpense.use-case';
import { UpdateExpenseUseCase } from '../../expences/expence/application/use-cases/update-expense.use-case';
import { FindExpenseByIdUsecase } from '../../expences/expence/application/use-cases/find-expense-by-id.usecase';
import { FindAllPaginatedExpensesUseCase } from '../../expences/expence/application/use-cases/find-all-pagianted-expenses-use-case.service';

import {
  CreateExpenseDto,
  UpdateExpenseDto,
} from '../../expences/expence/application/expense..dto';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  private logger = new Logger(ExpensesController.name);
  constructor(
    private readonly createExpenseUseCase: CreateExpenseUseCase,
    private readonly deleteExpenseUseCase: DeleteExpenseUseCase,
    private readonly updateExpenseUseCase: UpdateExpenseUseCase,
    private readonly findExpenseByIdUseCase: FindExpenseByIdUsecase,
    private readonly findAllExpensesUseCase: FindAllPaginatedExpensesUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiBody({ type: CreateExpenseDto })
  @ApiResponse({ status: 201, description: 'Expense created successfully' })
  create(@CurrentUser() user: any, @Body() dto: CreateExpenseDto) {
    console.log(user, dto);
    return this.createExpenseUseCase.execute(user.userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an expense by ID' })
  @ApiParam({ name: 'id', example: 'uuid-of-expense' })
  @ApiBody({ type: UpdateExpenseDto })
  @ApiResponse({ status: 200, description: 'Expense updated successfully' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  update(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.updateExpenseUseCase.execute(id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expenses (paginated)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Expenses fetched successfully' })
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.findAllExpensesUseCase.execute({
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense by ID' })
  @ApiParam({ name: 'id', example: 'uuid-of-expense' })
  @ApiResponse({ status: 200, description: 'Expense found' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  findById(@Param('id') id: string) {
    return this.findExpenseByIdUseCase.execute(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete expense by ID' })
  @ApiParam({ name: 'id', example: 'uuid-of-expense' })
  @ApiResponse({ status: 200, description: 'Expense deleted successfully' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  delete(@Param('id') id: string) {
    return this.deleteExpenseUseCase.execute(id);
  }
}
