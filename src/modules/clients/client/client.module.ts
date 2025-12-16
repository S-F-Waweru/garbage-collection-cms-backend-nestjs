// client.module.ts
import { DeleteClientUseCase } from './application/use-cases/delete.client-use-case';
import { FindAllClientsUseCase } from './application/use-cases/find-all-pagiantion.use-case';
import { Module } from '@nestjs/common';
import { RepositoriesModule } from '../../../shared/repositories/repositories.module';
import { LocationModule } from '../../location/location.module';
import { ClientController } from './presentaion/client.controller';
import { CreateClientUseCase } from './application/use-cases/create-client.use-case';
import { UpdateClientUseCase } from './application/use-cases/update.use-case';
import { FindClientByIdUseCase } from './application/use-cases/find-by-id.use-case';
import { IClientRepository } from './domain/interface/client.repository.interface';
import { ClientRepository } from './infrastructure/perisistence/repository/client.repository';

@Module({
  imports: [RepositoriesModule, LocationModule],
  controllers: [ClientController],
  providers: [
    CreateClientUseCase,
    UpdateClientUseCase,
    DeleteClientUseCase,
    FindAllClientsUseCase,
    FindClientByIdUseCase,
  ],
  exports: [RepositoriesModule],
})
export class ClientModule {}
