import { IClientRepository } from '../../../domain/interface/client.repository.interface';
import { Client } from '../../../domain/entities/client.entity';
import { ClientSchema } from '../schema/client.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, IsNull, Repository } from 'typeorm';
import {
  Building,
  PaymentMethod,
} from '../../../../building/domain/building.entity';
import { Injectable, Logger } from '@nestjs/common';
import { Location } from '../../../../../location/domain/entities/location.entity';

@Injectable()
export class ClientRepository implements IClientRepository {
  logger = new Logger(ClientRepository.name);
  constructor(
    @InjectRepository(ClientSchema)
    private readonly repository: Repository<ClientSchema>,
  ) {}
  async delete(id: string): Promise<{ message: string }> {
    await this.repository.softDelete(id);

    return {
      message: ` Client deleted.`,
    };
  }

  async findAll(): Promise<Client[]> {
    const schemas = await this.repository.find({
      where: { deletedAt: IsNull() },
    });

    return schemas.map((m) => this.toDomain(m));
  }

  // async findById(id: string): Promise<Client | null> {
  //   const schema = await this.repository.findOne({
  //     where: { id, deletedAt: IsNull() },
  //   });
  //   this.logger.debug(schema);
  //   return schema ? this.toDomain(schema) : null;
  // }

  async findById(id: string): Promise<Client | null> {
    const schema = await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['buildings'], // Add this
    });

    this.logger.debug(schema);
    return schema ? this.toDomain(schema) : null;
  }

  async findByKRAPin(KRAPin: string): Promise<Client | null> {
    const schema = await this.repository.findOne({
      where: { KRAPin, deletedAt: IsNull() },
    });

    return schema ? this.toDomain(schema) : null;
  }

  async save(client: Client): Promise<Client> {
    const schema = this.toSchema(client);
    const saved = await this.repository.save(schema);
    return this.toDomain(saved);
  }

  async findAllPaginated(
    skip: number,
    limit: number,
    searchTerm?: string,
  ): Promise<[Client[], number]> {
    // 1. Define the base filter (Soft delete check)
    let whereCondition:
      | FindOptionsWhere<ClientSchema>
      | FindOptionsWhere<ClientSchema>[] = {
      deletedAt: IsNull(),
    };

    // 2. If searchTerm exists, create an OR condition across the 4 fields
    if (searchTerm) {
      const likeTerm = ILike(`%${searchTerm}%`);

      // In TypeORM, an array [{}, {}] acts as (Cond1 OR Cond2)
      whereCondition = [
        { companyName: likeTerm, deletedAt: IsNull() },
        { KRAPin: likeTerm, deletedAt: IsNull() },
        { firstName: likeTerm, deletedAt: IsNull() },
        { lastName: likeTerm, deletedAt: IsNull() },
      ];
    }

    const [schemas, total] = await this.repository.findAndCount({
      where: whereCondition,
      skip,
      take: limit,
      relations: ['buildings'],
    });

    return [schemas.map((schema) => this.toDomain(schema)), total];
  }

  toSchema(client: Client) {
    const data: {
      id: string;
      companyName: string;
      KRAPin: string;
      firstName: string;
      lastName: string;
      email: string;
      billingDate: number;
      phone: string;
      paymentMethod: PaymentMethod;
    } = {
      id: client.id,
      companyName: client.companyName,
      KRAPin: client.KRAPin || '',
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      billingDate: client.billingDate,
      paymentMethod: client.paymentMethod,
    };

    return this.repository.create(data);
  }

  // toDomain(schema: ClientSchema) {
  //   const buildings = [];
  //
  //   return Client.fromPersistence({
  //     id: schema.id,
  //     companyName: schema.companyName,
  //     KRAPin: schema.KRAPin,
  //     firstName: schema.firstName,
  //     lastName: schema.lastName,
  //     email: schema.email,
  //     phone: schema.phone,
  //     billingDate: schema.billingDate,
  //     paymentMethod: schema.paymentMethod,
  //     buildings,
  //   });
  // }
  toDomain(schema: ClientSchema) {
    const buildings = schema.buildings
      ? schema.buildings.map((b) => {
          // Map Location
          const location = Location.fromPersistence({
            id: b.location.id,
            city: b.location.city,
            region: b.location.region,
          });

          // Create a temporary client reference to avoid circular dependency
          const clientRef = Client.fromPersistence({
            id: schema.id,
            companyName: schema.companyName,
            KRAPin: schema.KRAPin,
            firstName: schema.firstName,
            lastName: schema.lastName,
            email: schema.email,
            phone: schema.phone,
            billingDate: schema.billingDate,
            paymentMethod: schema.paymentMethod,
            buildings: [], // Empty to avoid circular reference
          });

          return Building.fromPersistence({
            id: b.id,
            name: b.name,
            location: location,
            client: clientRef,
            unitPrice: b.unitPrice,
            unitCount: b.unitCount,
            activeUnits: b.activeUnits,
            binsAssigned: b.binsAssigned,
          });
        })
      : [];

    return Client.fromPersistence({
      id: schema.id,
      companyName: schema.companyName,
      KRAPin: schema.KRAPin,
      firstName: schema.firstName,
      lastName: schema.lastName,
      email: schema.email,
      phone: schema.phone,
      billingDate: schema.billingDate,
      paymentMethod: schema.paymentMethod,
      buildings,
    });
  }
}
