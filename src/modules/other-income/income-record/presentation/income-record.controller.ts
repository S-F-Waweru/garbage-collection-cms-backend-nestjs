import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';

import {
  CreateIncomeRecordDto,
  UpdateIncomeRecordDto,
} from '../application/dto/income-record.dto';
import { CreateIncomeRecordUseCase } from '../application/use-cases/create-income-record.use-case';
import { DeleteIncomeRecordUseCase } from '../application/use-cases/get-income-record-by-id.use-case';
import { GetIncomeCategoryByIdUseCase } from '../../income-category/application/use-case/get-income-category-by-id.use-case';
import { GetAllIncomeRecordsUseCase } from '../application/use-cases/get-all-income-records.use-case';
import { UpdateIncomeRecordUseCase } from '../application/use-cases/update-income-record.use-case';

@Controller('income-records')
export class IncomeRecordController {
  constructor(
    private readonly createUseCase: CreateIncomeRecordUseCase,
    private readonly updateUseCase: UpdateIncomeRecordUseCase,
    private readonly deleteUseCase: DeleteIncomeRecordUseCase,
    private readonly getByIdUseCase: GetIncomeCategoryByIdUseCase,
    private readonly getAllUseCase: GetAllIncomeRecordsUseCase,
  ) {}

  // -----------------------
  // GET all
  // -----------------------
  @Get()
  async findAll() {
    return this.getAllUseCase.execute();
  }

  // -----------------------
  // GET by ID
  // -----------------------
  @Get(':id')
  async findById(@Param('id') id: string) {
    const record = await this.getByIdUseCase.execute(id);
    if (!record) throw new NotFoundException('Income record not found');
    return record;
  }

  // -----------------------
  // CREATE
  // -----------------------
  @Post()
  async create(@Body() dto: CreateIncomeRecordDto) {
    return this.createUseCase.execute(dto);
  }

  // -----------------------
  // UPDATE
  // -----------------------
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateIncomeRecordDto) {
    return this.updateUseCase.execute({ id, ...dto });
  }

  // -----------------------
  // DELETE
  // -----------------------
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.deleteUseCase.execute(id);
    return { deleted: true };
  }
}
