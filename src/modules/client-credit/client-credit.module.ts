import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClientCreditSchema } from './infrastructure/persisitence/schema/client-credit.schema';
import { ICreditClientRepository } from './domain/client_credit.repository.interfacace';
import { ClientCreditRepository } from './infrastructure/persisitence/repository/client-credit.repository';
import { CreateClientCreditUseCase } from './application/usecase/create-credit.usecase';
import { DecrementBalanceUseCase } from './application/usecase/decreament-balance.usecase';
import { GetClientCreditUseCase } from './application/usecase/getClientCredit.usecase';
import { IncrementBalanceUseCase } from './application/usecase/increment-balance.use-case';
import { UpdateBalanceUseCase } from './application/usecase/update-balance.usecase';
import { RepositoriesModule } from '../../shared/repositories/repositories.module';
import { ClientCreditController } from './presentation/client-credit.contoller';
import { GetCreditByClientIdUseCase } from './application/usecase/get-credit-by-client-id.use-case'; // Adjust path

@Module({
  imports: [
    TypeOrmModule.forFeature([ClientCreditSchema]),
    RepositoriesModule, // Add your entity
  ],
  providers: [
    CreateClientCreditUseCase,
    DecrementBalanceUseCase,
    GetClientCreditUseCase,
    IncrementBalanceUseCase,
    UpdateBalanceUseCase,
    GetCreditByClientIdUseCase, //
    { provide: ICreditClientRepository, useClass: ClientCreditRepository },
  ],
  controllers: [ClientCreditController],
  exports: [
    ICreditClientRepository, // ✅ Exports both for GenerateInvoiceUseCase
  ],
})
export class ClientCreditModule {}
