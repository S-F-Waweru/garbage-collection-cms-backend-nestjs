import { Inject, Injectable } from '@nestjs/common';
import { ILocationRepository } from '../../domain/interface/location.repository.inteface';

@Injectable()
export class GetLocationListUseCase {
  constructor(
    @Inject(ILocationRepository)
    private locationRepository: ILocationRepository,
  ) {}
  async execute() {
    const locations = await this.locationRepository.getAll();
    if (locations) {
      return locations;
    }
    return [];
  }
}
