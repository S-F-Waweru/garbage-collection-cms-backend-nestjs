import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
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
  logger = new Logger(UpdateBuildingUseCase.name);

  async execute(id: string, dto: UpdateBuildingDto) {
    this.logger.debug(
      `Updating building ${id} with data: ${JSON.stringify(dto)}`,
    );
    const {
      name,
      locationId,
      clientId,
      unitPrice,
      unitCount,
      binsAssigned,
      activeUnits,
    } = dto;

    const building = await this.buildingRepository.findById(id);

    if (!building) {
      throw new NotFoundException('Building not found');
    }

    this.logger.debug(`Found building`, building);

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
      binsAssigned,
      activeUnits,
    });

    this.logger.debug(`Updated buidling`, building);

    await this.buildingRepository.save(building);
    return {
      id: building.id,
      message: `Building updated `,
    };
  }
}
