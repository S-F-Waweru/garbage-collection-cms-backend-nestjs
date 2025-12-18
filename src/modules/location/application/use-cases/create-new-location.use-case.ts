import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { ILocationRepository } from '../../domain/interface/location.repository.inteface';
import { CreateLocationDto } from '../dto/location.dto';
import { Location } from '../../domain/entities/location.entity';

@Injectable()
export class CreateNewLocationUseCase {
  constructor(
    @Inject(ILocationRepository)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async execute(dto: CreateLocationDto) {
    // check if location exists
    let { city, region } = dto;
    city = city.toLowerCase();
    region = region.toLowerCase();
    const exists = await this.locationRepository.exists(city, region);
    if (exists) {
      throw new ConflictException('Location already exists'); // replace with proper exception
    }
    const location = Location.create({ city, region });

    const newLocation = await this.locationRepository.save(location);

    return {
      id: newLocation.id,
      city: newLocation.city,
      region: newLocation.region,
      message: 'Location created successfully',
    };
  }
}
