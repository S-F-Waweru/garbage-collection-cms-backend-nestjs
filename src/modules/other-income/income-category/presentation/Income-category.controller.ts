import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateIncomeCategoryUseCase } from '../application/use-case/create-income-categoty.use-case';
import { UpdateIncomeCategoryUseCase } from '../application/use-case/update-income-category.use-case';
import { DeleteIncomeCategoryUseCase } from '../application/use-case/delete-category-income.use-case';
import { GetIncomeCategoryByIdUseCase } from '../application/use-case/get-income-category-by-id.use-case';
import { ListIncomeCategoriesUseCase } from '../application/use-case/list-income-categories.usecase';
import {
  CreateIncomeCategoryDto,
  UpdateIncomeCategoryDto,
} from '../application/dto/Income-category.dto';
import { IncomeCategory } from '../domain/income-category.entity';

@Controller('income-categories')
export class IncomeCategoryController {
  constructor(
    private readonly createUseCase: CreateIncomeCategoryUseCase,
    private readonly updateUseCase: UpdateIncomeCategoryUseCase,
    private readonly deleteUseCase: DeleteIncomeCategoryUseCase,
    private readonly getByIdUseCase: GetIncomeCategoryByIdUseCase,
    private readonly listUseCase: ListIncomeCategoriesUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateIncomeCategoryDto) {
    return this.createUseCase.execute(dto);
  }

  @Get()
  async list(): Promise<IncomeCategory[]> {
    return this.listUseCase.execute({});
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.getByIdUseCase.execute(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateIncomeCategoryDto) {
    return this.updateUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    return this.deleteUseCase.execute(id);
  }
}
