import { Injectable, Inject } from "@nestjs/common";
import { ICreditClientRepository } from "../../domain/client_credit.repository.interfacace";
import { DecrementBalanceDto, ClientCreditResponseDto } from "../dto/client-credit.dto";

@Injectable()
export class DecrementBalanceUseCase {
    constructor(
        @Inject('ICreditClientRepository')
        private readonly creditRepository: ICreditClientRepository
    ) {}

    async execute(dto: DecrementBalanceDto): Promise<ClientCreditResponseDto> {
        const credit = await this.creditRepository.decrementBalance(dto.clientId, dto.amount);
        return ClientCreditResponseDto.fromDomain(credit);
    }
}