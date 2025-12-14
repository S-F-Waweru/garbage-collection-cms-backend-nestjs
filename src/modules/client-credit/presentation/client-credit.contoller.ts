import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { CreateClientCreditDto, IncrementBalanceDto, DecrementBalanceDto, UpdateBalanceDto, GetClientCreditDto } from "../application/dto/client-credit.dto";
import { CreateClientCreditUseCase } from "../application/usecase/create-credit.usecase";
import { DecrementBalanceUseCase } from "../application/usecase/decreament-balance.usecase";
import { GetClientCreditUseCase } from "../application/usecase/getClientCredit.usecase";
import { IncrementBalanceUseCase } from "../application/usecase/increment-balance.use-case";
import { UpdateBalanceUseCase } from "../application/usecase/update-balance.usecase";

@Controller('client-credit')
export class ClientCreditController {
    constructor(
        private readonly createClientCreditUseCase: CreateClientCreditUseCase,
        private readonly getClientCreditUseCase: GetClientCreditUseCase,
        private readonly getClientCreditBalanceUseCase: GetClientCreditUseCase,
        private readonly incrementBalanceUseCase: IncrementBalanceUseCase,
        private readonly decrementBalanceUseCase: DecrementBalanceUseCase,
        private readonly updateBalanceUseCase: UpdateBalanceUseCase
    ) {}

    @Post()
    async createClientCredit(@Body() dto: CreateClientCreditDto) {
        return this.createClientCreditUseCase.execute(dto);
    }

    @Get('client/:clientId')
    async getClientCredit(@Param('clientId') clientId: string) {
        return this.getClientCreditUseCase.execute({ clientId });
    }

    @Get('client/:clientId/balance')
    async getClientCreditBalance(@Param('clientId') clientId: GetClientCreditDto) {
        const balance = await this.getClientCreditBalanceUseCase.execute(clientId);
        return { clientId, balance };
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