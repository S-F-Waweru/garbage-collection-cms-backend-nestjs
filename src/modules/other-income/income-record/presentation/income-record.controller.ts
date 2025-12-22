import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  UseGuards,
  Query,
  Logger,
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

import {
  CreateIncomeRecordDto,
  UpdateIncomeRecordDto,
} from '../application/dto/income-record.dto';

import { CreateIncomeRecordUseCase } from '../application/use-cases/create-income-record.use-case';
import { DeleteIncomeRecordUseCase } from '../application/use-cases/delete-income-record.use-case';

import { GetAllIncomeRecordsUseCase } from '../application/use-cases/get-all-income-records.use-case';
import { UpdateIncomeRecordUseCase } from '../application/use-cases/update-income-record.use-case';

import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { GetIncomeCategoryByIdUseCase } from '../../income-category/application/use-case/get-income-category-by-id.use-case';

@ApiTags('Income Records')
@ApiBearerAuth()
@Controller('income-records')
export class IncomeRecordController {
  logger = new Logger(IncomeRecordController.name);
  constructor(
    private readonly createUseCase: CreateIncomeRecordUseCase,
    private readonly updateUseCase: UpdateIncomeRecordUseCase,
    private readonly deleteUseCase: DeleteIncomeRecordUseCase,
    private readonly getByIdUseCase: GetIncomeCategoryByIdUseCase,
    private readonly getAllUseCase: GetAllIncomeRecordsUseCase,
  ) {}
  // -----------------------
  // GET all (paginated)
  // -----------------------
  @Get()
  @ApiOperation({ summary: 'Get all income records (paginated)' })
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
    description: 'Number of items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Income records fetched successfully',
  })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.getAllUseCase.execute({
      page: Number(page),
      limit: Number(limit),
    });
  }

  // -----------------------
  // GET by ID
  // -----------------------
  @Get(':id')
  @ApiOperation({ summary: 'Get income record by ID' })
  @ApiParam({ name: 'id', example: 'uuid-of-income-record' })
  @ApiResponse({ status: 200, description: 'Income record found' })
  @ApiResponse({ status: 404, description: 'Income record not found' })
  async findById(@Param('id') id: string) {
    const record = await this.getByIdUseCase.execute(id);
    if (!record) throw new NotFoundException('Income record not found');
    return record;
  }

  // -----------------------
  // CREATE
  // -----------------------
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new income record' })
  @ApiBody({ type: CreateIncomeRecordDto })
  @ApiResponse({
    status: 201,
    description: 'Income record created successfully',
  })
  create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateIncomeRecordDto,
  ) {
    this.logger.debug('CreateIncomeRecordDto');
    this.logger.debug(dto);
    return this.createUseCase.execute(user.userId, dto);
  }

  // -----------------------
  // UPDATE
  // -----------------------
  @Put(':id')
  @ApiOperation({ summary: 'Update income record by ID' })
  @ApiParam({ name: 'id', example: 'uuid-of-income-record' })
  @ApiBody({ type: UpdateIncomeRecordDto })
  @ApiResponse({
    status: 200,
    description: 'Income record updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Income record not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateIncomeRecordDto) {
    return this.updateUseCase.execute({ id, ...dto });
  }

  // -----------------------
  // DELETE
  // -----------------------
  @Delete(':id')
  @ApiOperation({ summary: 'Delete income record by ID' })
  @ApiParam({ name: 'id', example: 'uuid-of-income-record' })
  @ApiResponse({
    status: 200,
    description: 'Income record deleted successfully',
  })
  async delete(@Param('id') id: string) {
    await this.deleteUseCase.execute(id);
    return { deleted: true };
  }
}
