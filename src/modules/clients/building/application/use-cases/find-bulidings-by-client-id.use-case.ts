import { IBuildingRepository } from '../../domain/interface/buidling.repsository.interface';
import { Inject } from '@nestjs/common';

export class FindBulidingsByClientIdUseCase {
  constructor(
    @Inject(IBuildingRepository)
    private readonly buildingRepository: IBuildingRepository,
  ) {}

  async execute(clientID: string) {
    const buildings = this.buildingRepository.findClientBuildings(clientID);

    if (buildings) {
      return buildings;
    }
    return [];
  }
}
