import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID, Min } from 'class-validator';

import { IClientRepository } from 'src/modules/clients/client/domain/interface/client.repository.interface';
import { ClientCredit } from '../../domain/client-credit.entity';

// ==================== DTOs ====================

export class CreateClientCreditDto {
    @IsNotEmpty()
    @IsUUID()
    clientId: string;

    @IsNumber()
    @Min(0)
    balance?: number;
}

export class UpdateBalanceDto {
    @IsNotEmpty()
    @IsUUID()
    clientId: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    balance: number;
}

export class IncrementBalanceDto {
    @IsNotEmpty()
    @IsUUID()
    clientId: string;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    amount: number;
}

export class DecrementBalanceDto {
    @IsNotEmpty()
    @IsUUID()
    clientId: string;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    amount: number;
}

export class GetClientCreditDto {
    @IsNotEmpty()
    @IsUUID()
    clientId: string;
}

export class ClientCreditResponseDto {
    id: string;
    clientId: string;
    balance: number;
    createdAt: Date;
    updatedAt: Date;

    static fromDomain(credit: ClientCredit): ClientCreditResponseDto {
        return {
            id: credit.id,
            clientId: credit.client.id,
            balance: credit.balance,
            createdAt: credit.createdAt,
            updatedAt: credit.updatedAt
        };
    }
}







