import { Inject, Injectable } from '@nestjs/common';
import { ILocationRepository } from '../../domain/interface/location.repository.inteface';

@Injectable()
export class DeleteLocationUseCase {
  constructor(
    @Inject(ILocationRepository)
    private locationRepository: ILocationRepository,
  ) {}

  async execute(locationId: string): Promise<{ message: string }> {
    await this.locationRepository.delete(locationId);

    return {
      message: 'Location deleted successfully',
    };
  }
}
