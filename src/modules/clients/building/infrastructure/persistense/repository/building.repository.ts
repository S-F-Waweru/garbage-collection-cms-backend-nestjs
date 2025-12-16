import { IBuildingRepository } from '../../../domain/interface/buidling.repsository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { BuildingSchema } from '../schema/buildingSchema';
import { IsNull, Repository } from 'typeorm';
import { Building } from '../../../domain/building.entity';
import { Client } from '../../../../client/domain/entities/client.entity';
import { Location } from 'src/modules/location/domain/entities/location.entity';

export class BuildingRepository implements IBuildingRepository {
  constructor(
    @InjectRepository(BuildingSchema)
    private readonly repository: Repository<BuildingSchema>,
  ) {}

  private toSchema(building: Building) {
    const schema = this.repository.create({
      id: building.id,
      name: building.name,
      location: building.location,
      client: { id: building.client.id },
      unitPrice: building.unitPrice,
      unitCount: building.unitCount,
    });

    return schema;
  }

  private toDomain(schema: BuildingSchema): Building {
    const location = Location.fromPersistence({
      id: schema.location.id,
      city: schema.location.city,
      region: schema.location.region,
    });

    const client = Client.fromPersistence({
      id: schema.client.id,
      companyName: schema.client.companyName,
      KRAPin: schema.client.KRAPin,
      firstName: schema.client.firstName,
      lastName: schema.client.lastName,
      email: schema.client.email,
      billingDate: schema.client.billingDate,
      phone: schema.client.phone,
      paymentMethod: schema.client.paymentMethod,
      buildings: [],
    });

    return Building.fromPersistence({
      id: schema.id,
      name: schema.name,
      location: location,
      client: client,
      unitPrice: schema.unitPrice,
      unitCount: schema.unitCount,
    });
  }
  async findAll(): Promise<Building[]> {
    const schemas = await this.repository.find({
      where: { deletedAt: IsNull() },
      relations: ['client', 'location'],
    });

    return schemas.map((m) => this.toDomain(m));
  }

  async findById(id: string): Promise<Building | null> {
    const schema = await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['client', 'location'],
    });

    return schema ? this.toDomain(schema) : null;
  }

  async save(building: Building): Promise<Building | null> {
    const schema = this.toSchema(building);
    const savedBuilding = await this.repository.save(schema);

    // Reload with relations to properly map to domain
    const reloaded = await this.repository.findOne({
      where: { id: savedBuilding.id },
      relations: ['client', 'location'],
    });

    return reloaded ? this.toDomain(reloaded) : null;
  }

  async findClientBuildings(clientId: string): Promise<Building[]> {
    const schemas = await this.repository.find({
      where: {
        client: { id: clientId },
        deletedAt: IsNull(),
      },
      relations: ['client', 'location'],
    });

    return schemas.map((schema) => this.toDomain(schema));
  }
  async findAllPaginated(
    skip: number,
    limit: number,
  ): Promise<[Building[], number]> {
    const [schemas, total] = await this.repository.findAndCount({
      where: { deletedAt: IsNull() },
      relations: ['client', 'location'],
      skip,
      take: limit,
    });

    return [schemas.map((s) => this.toDomain(s)), total];
  }

  async delete(id: string) {
    await this.repository.softDelete(id);

    return {
      message: `Building deleted successfully`,
    };
  }
}
