import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Put,
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

import {
  CreateClientDto,
  UpdateClientDto,
} from '../application/dtos/client.dto';

import { CreateClientUseCase } from '../application/use-cases/create-client.use-case';
import { UpdateClientUseCase } from '../application/use-cases/update.use-case';
import { DeleteClientUseCase } from '../application/use-cases/delete.client-use-case';
import { FindClientByIdUseCase } from '../application/use-cases/find-by-id.use-case';
import { FindAllClientsUseCase } from '../application/use-cases/find-all-pagiantion.use-case';
import { FindAllClientsRawUseCase } from '../application/use-cases/find-raw-clients.usecase';

@ApiTags('Clients')
@Controller('clients')
export class ClientController {
  private readonly logger = new Logger(ClientController.name);
  constructor(
    private readonly createClientUseCase: CreateClientUseCase,
    private readonly updateClientUseCase: UpdateClientUseCase,
    private readonly deleteClientUseCase: DeleteClientUseCase,
    private readonly findClientByIdUseCase: FindClientByIdUseCase,
    private readonly findAllClientsUseCase: FindAllClientsUseCase,
    private readonly findAllClientsRawUseCase: FindAllClientsRawUseCase,
    
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  @ApiBody({ type: CreateClientDto })
  @ApiResponse({ status: 201, description: 'Client created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  async create(@Body() dto: CreateClientDto) {
    this.logger.debug(dto);
    return this.createClientUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all clients (paginated)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Clients fetched successfully' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    console.log(
      `DEBUG reaching the find all controlller ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`,
    );
    return this.findAllClientsUseCase.execute({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  }
  
  @Get('raw')
  @ApiOperation({ summary: 'Get all clients (paginated)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Clients fetched successfully' })
  async findAllNonPaginaited(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    console.log(
      `DEBUG reaching the find all controlller ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`,
    );
    return this.findAllClientsUseCase.execute({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get client by ID' })
  @ApiParam({ name: 'id', example: 'a3f1c2d4-1234-4567-890a-bcdef1234567' })
  @ApiResponse({ status: 200, description: 'Client found' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  async findById(@Param('id') id: string) {
    return this.findClientByIdUseCase.execute(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update client by ID' })
  @ApiParam({ name: 'id', example: 'a3f1c2d4-1234-4567-890a-bcdef1234567' })
  @ApiBody({ type: UpdateClientDto })
  @ApiResponse({ status: 200, description: 'Client updated successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.updateClientUseCase.execute(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete client by ID' })
  @ApiParam({ name: 'id', example: 'a3f1c2d4-1234-4567-890a-bcdef1234567' })
  @ApiResponse({ status: 200, description: 'Client deleted successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  async delete(@Param('id') id: string) {
    return this.deleteClientUseCase.execute(id);
  }
}
