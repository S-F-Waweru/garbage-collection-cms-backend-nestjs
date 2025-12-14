import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { ICreditClientRepository } from "../../domain/client_credit.repository.interfacace";
import { GetClientCreditDto, ClientCreditResponseDto } from "../dto/client-credit.dto";

@Injectable()
export class GetClientCreditUseCase {
    constructor(
        @Inject('ICreditClientRepository')
        private readonly creditRepository: ICreditClientRepository
    ) {}

    async execute(dto: GetClientCreditDto): Promise<ClientCreditResponseDto> {
        const credit = await this.creditRepository.findByClientId(dto.clientId);
        
        if (!credit) {
            throw new NotFoundException(`Client credit not found for client ${dto.clientId}`);
        }

        return ClientCreditResponseDto.fromDomain(credit);
    }
}