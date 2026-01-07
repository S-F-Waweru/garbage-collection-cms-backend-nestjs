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
import { FindAllClientsRawUseCase } from './application/use-cases/find-raw-clients.usecase';
import { ICreditClientRepository } from 'src/modules/client-credit/domain/client_credit.repository.interfacace';
import { ClientCreditRepository } from 'src/modules/client-credit/infrastructure/persisitence/repository/client-credit.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientCreditSchema } from 'src/modules/client-credit/infrastructure/persisitence/schema/client-credit.schema';
import { SystemUserService } from 'src/modules/auth/application/services/system-user.service';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
  imports: [
    RepositoriesModule,
    LocationModule,
    TypeOrmModule.forFeature([ClientCreditSchema]),
    AuthModule,
  ],
  controllers: [ClientController],

  providers: [
    CreateClientUseCase,
    UpdateClientUseCase,
    DeleteClientUseCase,
    FindAllClientsUseCase,
    FindClientByIdUseCase,
    FindAllClientsRawUseCase,
    SystemUserService,

    {
      provide: ICreditClientRepository,
      useClass: ClientCreditRepository,
    },
  ],
  exports: [RepositoriesModule],
})
export class ClientModule {}
