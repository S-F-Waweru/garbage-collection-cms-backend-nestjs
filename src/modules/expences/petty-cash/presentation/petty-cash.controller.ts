import {
  Body,
  Controller,
  Delete,
  Get,
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

import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';

import {
  CreatePettyCashDto,
  UpdatePettyCashDto,
} from '../application/dto/petty-cash.dto';

import { CreatePettyCashUseCase } from '../application/use-cases/create-petty-cash.use-case';
import { FindAllPettyCashUseCase } from '../application/use-cases/find-all-petty-cash.use-case';
import { FindPettyCashByIdUseCase } from '../application/use-cases/find-petty-cash-by-id.use-case';
import { UpdatePettyCashUseCase } from '../application/use-cases/update.petty-cash.use-case';
import { DeletePettyCashUseCase } from '../application/use-cases/delete-petty-cash.use-case';

export interface CurrentUserDto {
  userId: string;
  email?: string;
}

@ApiTags('Petty Cash')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('petty-cash')
export class PettyCashController {
  constructor(
    private readonly createPettyCashUseCase: CreatePettyCashUseCase,
    private readonly findAllPettyCashUseCase: FindAllPettyCashUseCase,
    private readonly findPettyCashByIdUseCase: FindPettyCashByIdUseCase,
    private readonly updatePettyCashUseCase: UpdatePettyCashUseCase,
    private readonly deletePettyCashUseCase: DeletePettyCashUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a petty cash record' })
  @ApiBody({ type: CreatePettyCashDto })
  @ApiResponse({ status: 201, description: 'Petty cash created successfully' })
  async createPettyCash(
    @CurrentUser() user: CurrentUserDto,
    @Body() dto: CreatePettyCashDto,
  ) {
    return this.createPettyCashUseCase.execute(user.userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update petty cash by ID' })
  @ApiParam({ name: 'id', example: 'uuid-of-petty-cash' })
  @ApiBody({ type: UpdatePettyCashDto })
  @ApiResponse({ status: 200, description: 'Petty cash updated successfully' })
  @ApiResponse({ status: 404, description: 'Petty cash not found' })
  async updatePettyCash(
    @Param('id') id: string,
    @Body() dto: UpdatePettyCashDto,
  ) {
    return this.updatePettyCashUseCase.execute(id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get petty cash by ID' })
  @ApiParam({ name: 'id', example: 'uuid-of-petty-cash' })
  @ApiResponse({ status: 200, description: 'Petty cash found' })
  @ApiResponse({ status: 404, description: 'Petty cash not found' })
  async getPettyCash(@Param('id') id: string) {
    return this.findPettyCashByIdUseCase.execute(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all petty cash records (paginated)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Petty cash records fetched successfully',
  })
  async getAllPettyCash(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.findAllPettyCashUseCase.execute({
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete petty cash by ID' })
  @ApiParam({ name: 'id', example: 'uuid-of-petty-cash' })
  @ApiResponse({ status: 200, description: 'Petty cash deleted successfully' })
  async deletePettyCash(@Param('id') id: string) {
    return this.deletePettyCashUseCase.execute(id);
  }
}
