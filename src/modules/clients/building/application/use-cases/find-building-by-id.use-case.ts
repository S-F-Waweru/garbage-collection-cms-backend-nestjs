import { Inject, NotFoundException } from '@nestjs/common';
import { IBuildingRepository } from '../../domain/interface/buidling.repsository.interface';
import { NotFoundError } from 'rxjs';

export class FindBuildingByIdUseCase {
  constructor(
    @Inject(IBuildingRepository)
    private buildingRepository: IBuildingRepository,
  ) {}

  async execute(id: string) {
    const building = await this.buildingRepository.findById(id);

    if (!building) {
      throw new NotFoundException(`Building with id ${id} not found`);
    }
    return building;
  }
}
