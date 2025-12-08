import { FindAllBuildingsUseCase } from './application/use-cases/find-all-buildings.use-case';
import { DeleteBuildingUseCase } from './application/use-cases/delete-building-use.case';
import { CreateBuildingUseCase } from './application/use-cases/create-building.use-case';
import { Module } from '@nestjs/common';
import { RepositoriesModule } from '../../../shared/repositories/repositories.module';
import { LocationModule } from '../../location/location.module';
import { BuildingController } from './presentation/building.controller';
import { UpdateBuildingUseCase } from './application/use-cases/update-buiding.use-case';
import { FindBulidingsByClientIdUseCase } from './application/use-cases/find-bulidings-by-client-id.use-case';
import { FindBuildingByIdUseCase } from './application/use-cases/find-building-by-id.use-case';

export class ClientModule {}

// building.module.ts
@Module({
  imports: [RepositoriesModule, LocationModule],
  controllers: [BuildingController],
  providers: [
    CreateBuildingUseCase,
    UpdateBuildingUseCase,
    DeleteBuildingUseCase,
    FindAllBuildingsUseCase,
    FindBulidingsByClientIdUseCase,
    FindBuildingByIdUseCase,
  ],
})
export class BuildingModule {}
