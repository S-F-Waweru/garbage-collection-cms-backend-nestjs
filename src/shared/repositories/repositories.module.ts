// shared/repositories.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IClientRepository } from '../../modules/clients/client/domain/interface/client.repository.interface';
import { ClientSchema } from '../../modules/clients/client/infrastructure/perisistence/schema/client.schema';
import { BuildingSchema } from '../../modules/clients/building/infrastructure/persistense/schema/buildingSchema';
import { LocationSchema } from '../../modules/location/infrastracture/persistence/schema/location.schema';
import { ClientRepository } from '../../modules/clients/client/infrastructure/perisistence/repository/client.repository';
import { IBuildingRepository } from '../../modules/clients/building/domain/interface/buidling.repsository.interface';
import { BuildingRepository } from '../../modules/clients/building/infrastructure/persistense/repository/building.repository';
import { ILocationRepository } from '../../modules/location/domain/interface/location.repository.inteface';
import { LocationRepository } from '../../modules/location/infrastracture/persistence/repository/location.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClientSchema, BuildingSchema, LocationSchema]),
  ],
  providers: [
    {
      provide: IClientRepository,
      useClass: ClientRepository,
    },
    {
      provide: IBuildingRepository,
      useClass: BuildingRepository,
    },
    {
      provide: ILocationRepository,
      useClass: LocationRepository,
    },
  ],
  exports: [IClientRepository, IBuildingRepository, ILocationRepository],
})
export class RepositoriesModule {}
