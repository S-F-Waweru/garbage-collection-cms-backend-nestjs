import { IBuildingRepository } from '../../domain/interface/buidling.repsository.interface';
import { Inject } from '@nestjs/common';

export class FindAllBuildingsUseCase {
  constructor(
    @Inject(IBuildingRepository)
    private readonly buildingRepository: IBuildingRepository,
  ) {}

  async execute() {
    const buildings = await this.buildingRepository.findAll();

    if (buildings) {
      return buildings;
    }

    return [];
  }
}
