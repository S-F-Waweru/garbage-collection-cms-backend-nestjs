import { LocationController } from './presentation/location.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationSchema } from './infrastracture/persistence/schema/location.schema';
import { LocationRepository } from './infrastracture/persistence/repository/location.repository';

import { CreateNewLocationUseCase } from './application/use-cases/create-new-location.use-case';
import { GetLocationListUseCase } from './application/use-cases/get-location-list.use-case';
import { GetLocationByIdUseCase } from './application/use-cases/get-location.by-id.use-case';
import { UpdateLocationUseCase } from './application/use-cases/update-location.use-case';
import { DeleteLocationUseCase } from './application/use-cases/delete-location.use-case';
import { ILocationRepository } from './domain/interface/location.repository.inteface';
import { GetRawLocationsUSecase } from './application/use-cases/getRawLocation.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([LocationSchema])],
  controllers: [LocationController],
  providers: [
    // Use cases
    CreateNewLocationUseCase,
    GetLocationListUseCase,
    GetLocationByIdUseCase,
    UpdateLocationUseCase,
    DeleteLocationUseCase,
    GetRawLocationsUSecase,
    // Repository
    {
      provide: ILocationRepository, // ← Use the Symbol, not string
      useClass: LocationRepository,
    },
  ],
  exports: [ILocationRepository],
})
export class LocationModule {}
