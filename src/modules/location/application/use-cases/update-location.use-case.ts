import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ILocationRepository } from '../../domain/interface/location.repository.inteface';
import { UpdateLocationDto } from '../dto/location.dto';

@Injectable()
export class UpdateLocationUseCase {
  constructor(
    @Inject(ILocationRepository)
    private locationRepository: ILocationRepository,
  ) {}

  async execute(id: string, dto: UpdateLocationDto) {
    console.log(`=============DEBUG================`);
    console.log('debug:(UpdateLocationUseCase)', id, dto);
    const { city, region } = dto;

    const locationEntity = await this.locationRepository.findById(id);
    if (!locationEntity) {
      throw new NotFoundException('Location not found');
    }

    locationEntity.updateLocation(city, region);
    await this.locationRepository.save(locationEntity);
    return {
      id: locationEntity.id,
      city: locationEntity.city,
      location: locationEntity.region,
      message: 'Location updated successfully',
    };
  }
}
