import { IBuildingRepository } from '../../domain/interface/buidling.repsository.interface';
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CreateBuildingDto } from '../dto/building.dto';
import { ILocationRepository } from '../../../../location/domain/interface/location.repository.inteface';
import { IClientRepository } from '../../../client/domain/interface/client.repository.interface';

import { Building } from '../../domain/building.entity';

!Injectable();
export class CreateBuildingUseCase {
  constructor(
    @Inject(IBuildingRepository)
    private readonly buildingRepository: IBuildingRepository,
    @Inject(ILocationRepository)
    private readonly locationRepository: ILocationRepository,

    @Inject(IClientRepository)
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(dto: CreateBuildingDto) {
    const { name, locationId, clientId, unitPrice, unitCount } = dto;

    const location = await this.locationRepository.findById(locationId);

    const client = await this.clientRepository.findById(clientId);

    if (!location) {
      throw new BadRequestException('Location not found');
    }

    if (!client) {
      throw new BadRequestException('Client not found');
    }

    const building = Building.create({
      name,
      location,
      client,
      unitCount,
      unitPrice,
    });

    const savedBuilding = await this.buildingRepository.save(building);

    return {
      id: savedBuilding?.id,
      message: `Building saved successfully`,
    };
  }
}
