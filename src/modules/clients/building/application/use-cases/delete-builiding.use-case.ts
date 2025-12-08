import { Inject, NotFoundException } from '@nestjs/common';
import { IBuildingRepository } from '../../domain/interface/buidling.repsository.interface';

export class DeleteBuilidingUseCase {
  constructor(
    @Inject(IBuildingRepository)
    private readonly buildingRepository: IBuildingRepository,
  ) {}

  async execute(id: string): Promise<{ message: string }> {
    const building = await this.buildingRepository.findById(id);

    if (!building) {
      throw new NotFoundException('building not found');
    }

    return await this.buildingRepository.delete(id);
  }
}
