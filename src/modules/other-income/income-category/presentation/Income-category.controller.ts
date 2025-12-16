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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

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

@ApiTags('Income Categories')
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
  @ApiOperation({ summary: 'Create a new income category' })
  @ApiBody({ type: CreateIncomeCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Income category created successfully',
  })
  async create(@Body() dto: CreateIncomeCategoryDto) {
    return this.createUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all income categories (paginated)' })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Income categories fetched successfully',
  })
  async list(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return await this.listUseCase.execute({
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get income category by ID' })
  @ApiParam({ name: 'id', example: 'uuid-of-category' })
  @ApiResponse({
    status: 200,
    description: 'Income category fetched successfully',
  })
  @ApiResponse({ status: 404, description: 'Income category not found' })
  async getById(@Param('id') id: string) {
    return this.getByIdUseCase.execute(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update income category by ID' })
  @ApiParam({ name: 'id', example: 'uuid-of-category' })
  @ApiBody({ type: UpdateIncomeCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Income category updated successfully',
  })
  async update(@Param('id') id: string, @Body() dto: UpdateIncomeCategoryDto) {
    return this.updateUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete income category by ID' })
  @ApiParam({ name: 'id', example: 'uuid-of-category' })
  @ApiResponse({
    status: 200,
    description: 'Income category deleted successfully',
  })
  async delete(@Param('id') id: string) {
    return this.deleteUseCase.execute(id);
  }
}
