import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  CreateClientCreditDto,
  IncrementBalanceDto,
  DecrementBalanceDto,
  UpdateBalanceDto,
} from '../application/dto/client-credit.dto';
import { CreateClientCreditUseCase } from '../application/usecase/create-credit.usecase';
import { DecrementBalanceUseCase } from '../application/usecase/decreament-balance.usecase';
import { GetClientCreditUseCase } from '../application/usecase/getClientCredit.usecase';
import { IncrementBalanceUseCase } from '../application/usecase/increment-balance.use-case';
import { UpdateBalanceUseCase } from '../application/usecase/update-balance.usecase';
import { GetCreditByClientIdUseCase } from '../application/usecase/get-credit-by-client-id.use-case';

@Controller('credit')
export class ClientCreditController {
  constructor(
    private readonly createClientCreditUseCase: CreateClientCreditUseCase,
    private readonly getClientCreditUseCase: GetClientCreditUseCase,
    private readonly incrementBalanceUseCase: IncrementBalanceUseCase,
    private readonly decrementBalanceUseCase: DecrementBalanceUseCase,
    private readonly updateBalanceUseCase: UpdateBalanceUseCase,
    private readonly getClientCreditByIdUseCase: GetCreditByClientIdUseCase,
  ) {}
  private readonly logger = new Logger(ClientCreditController.name);

  @Post()
  async createClientCredit(@Body() dto: CreateClientCreditDto) {
    return this.createClientCreditUseCase.execute(dto);
  }

  @Get('client/:clientId')
  async getCreditById(@Param('clientId') clientId: string) {
    this.logger.debug('CreditController == GetCreditById');
    return this.getClientCreditByIdUseCase.execute(clientId);
  }

  @Get('client/:clientId/balance')
  async getClientCreditBalance(@Param('clientId') clientId: string) {
    const balance = await this.getClientCreditUseCase.execute({
      clientId,
    });
    return { clientId, balance };
  }

  @Get(':clientId')
  async getClientCredit(@Param('clientId') clientId: string) {
    return this.getClientCreditUseCase.execute({ clientId });
  }

  @Patch('increment')
  async incrementBalance(@Body() dto: IncrementBalanceDto) {
    return this.incrementBalanceUseCase.execute(dto);
  }

  @Patch('decrement')
  async decrementBalance(@Body() dto: DecrementBalanceDto) {
    return this.decrementBalanceUseCase.execute(dto);
  }

  @Patch('update')
  async updateBalance(@Body() dto: UpdateBalanceDto) {
    return this.updateBalanceUseCase.execute(dto);
  }
}
