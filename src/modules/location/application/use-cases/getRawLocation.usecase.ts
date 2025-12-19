import { Injectable, Inject } from '@nestjs/common';
import { ILocationRepository } from '../../domain/interface/location.repository.inteface';

@Injectable()
export class GetRawLocationsUSecase {
  constructor(
    @Inject(ILocationRepository)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async execute() {
    const locations = await this.locationRepository.getAll();
    if (locations.length > 0) {
      return locations;
    }

    return [];
  }
}
