import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IBuildingRepository } from '../../domain/interface/buidling.repsository.interface';
import { IClientRepository } from '../../../client/domain/interface/client.repository.interface';

import { ILocationRepository } from '../../../../location/domain/interface/location.repository.inteface';
import { UpdateBuildingDto } from '../dto/building.dto';

@Injectable()
export class UpdateBuildingUseCase {
  constructor(
    @Inject(IBuildingRepository)
    private readonly buildingRepository: IBuildingRepository,
    @Inject(IClientRepository)
    private readonly clientRepository: IClientRepository,
    @Inject(ILocationRepository)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async execute(id: string, dto: UpdateBuildingDto) {
    const { name, locationId, clientId, unitPrice, unitCount } = dto;

    const building = await this.buildingRepository.findById(id);

    if (!building) {
      throw new NotFoundException('Building not found');
    }

    const location = await this.locationRepository.findById(locationId);

    const client = await this.clientRepository.findById(clientId);

    if (!location) {
      throw new BadRequestException('Location not found');
    }

    if (!client) {
      throw new BadRequestException('Client not found');
    }

    building.update({
      name,
      location,
      client,
      unitCount,
      unitPrice,
    });

    return {
      id: building.id,
      message: `Building updated `,
    };
  }
}
