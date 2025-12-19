import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Client } from '../../domain/entities/client.entity';
import { IClientRepository } from '../../domain/interface/client.repository.interface';
import { Building } from '../../../building/domain/building.entity';
import { IBuildingRepository } from '../../../building/domain/interface/buidling.repsository.interface';
import { ILocationRepository } from '../../../../location/domain/interface/location.repository.inteface';
import { CreateClientDto } from '../dtos/client.dto';
import { log } from 'node:console';

@Injectable()
export class CreateClientUseCase {
  private readonly logger = new Logger(CreateClientUseCase.name);
  constructor(
    @Inject(IClientRepository)
    private readonly clientRepository: IClientRepository,
    @Inject(IBuildingRepository)
    private readonly buildingRepository: IBuildingRepository,
    @Inject(ILocationRepository)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async execute(dto: CreateClientDto): Promise<Client> {
    const existing = await this.clientRepository.findByKRAPin(dto.KRAPin);
    if (existing) {
      throw new ConflictException('Use with this KRAPin exist');
    }
    // First, create the client WITHOUT buildings
    this.logger.debug(dto);
    const client = Client.create({
      companyName: dto.companyName,
      KRAPin: dto.KRAPin,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      paymentMethod: dto.paymentMethod,
      buildings: [],
    });

    // Save the client first to get an ID
    const savedClient = await this.clientRepository.save(client);
    console.log(savedClient);

    this.logger.debug(savedClient);

    // If buildings are provided, create and save them
    if (dto.buildings && dto.buildings.length > 0) {
      const buildingPromises = dto.buildings.map(async (buildingDto) => {
        const locationID = buildingDto.locationId;
        // Find location by ID
        const location = await this.locationRepository.findById(locationID);

        if (!location) {
          throw new NotFoundException(
            `Location with ID ${locationID} not found`,
          );
        }

        // Create building
        const building = Building.create({
          name: buildingDto.name,
          location,
          client: savedClient,
          unitPrice: buildingDto.unitPrice,
          unitCount: buildingDto.unitCount,
        });

        // Save and return the building
        return this.buildingRepository.save(building);
      });

      // Wait for all buildings to be saved
      const savedB = await Promise.all(buildingPromises);

      this.logger.debug(savedB);
    }

    // Return the client (reload with buildings)
    const clientWithBuildings = await this.clientRepository.findById(
      savedClient.id,
    );

    this.logger.debug(clientWithBuildings);

    if (!clientWithBuildings) {
      throw new NotFoundException('Client not found after creation');
    }

    this.logger.debug(clientWithBuildings);
    return clientWithBuildings;
  }
}
