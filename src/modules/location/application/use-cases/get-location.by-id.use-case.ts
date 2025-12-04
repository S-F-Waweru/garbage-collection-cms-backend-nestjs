import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ILocationRepository } from '../../domain/interface/location.repository.inteface';

@Injectable()
export class GetLocationByIdUseCase {
  constructor(
    @Inject(ILocationRepository)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async execute(locationId: string) {
    const location = await this.locationRepository.findById(locationId);
    if (!location) {
      throw new NotFoundException('Location not found');
    }
    return location;
  }
}
