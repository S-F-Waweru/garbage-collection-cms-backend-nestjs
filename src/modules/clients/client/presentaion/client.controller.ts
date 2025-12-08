import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import {
  CreateClientDto,
  UpdateClientDto,
} from '../application/dtos/client.dto';
import { CreateClientUseCase } from '../application/use-cases/create-client.use-case';
import { UpdateClientUseCase } from '../application/use-cases/update.use-case';
import { DeleteClientUseCase } from '../application/use-cases/delete.client-use-case';
import { FindClientByIdUseCase } from '../application/use-cases/find-by-id.use-case';
import { FindAllClientsUseCase } from '../application/use-cases/find-all-pagiantion.use-case';

@Controller('clients')
export class ClientController {
  constructor(
    private readonly createClientUseCase: CreateClientUseCase,
    private readonly updateClientUseCase: UpdateClientUseCase,
    private readonly deleteClientUseCase: DeleteClientUseCase,
    private readonly findClientByIdUseCase: FindClientByIdUseCase,
    private readonly findAllClientsUseCase: FindAllClientsUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateClientDto) {
    return await this.createClientUseCase.execute(dto);
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return await this.findAllClientsUseCase.execute({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.findClientByIdUseCase.execute(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return await this.updateClientUseCase.execute(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.deleteClientUseCase.execute(id);
  }
}
