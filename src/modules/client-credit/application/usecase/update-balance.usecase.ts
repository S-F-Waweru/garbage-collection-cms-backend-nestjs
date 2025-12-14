import { Injectable, Inject } from "@nestjs/common";
import { ICreditClientRepository } from "../../domain/client_credit.repository.interfacace";
import { UpdateBalanceDto, ClientCreditResponseDto } from "../dto/client-credit.dto";

@Injectable()
export class UpdateBalanceUseCase {
    constructor(
        @Inject('ICreditClientRepository')
        private readonly creditRepository: ICreditClientRepository
    ) {}

    async execute(dto: UpdateBalanceDto): Promise<ClientCreditResponseDto> {
        const credit = await this.creditRepository.updateBalance(dto.clientId, dto.balance);
        return ClientCreditResponseDto.fromDomain(credit);
    }
}