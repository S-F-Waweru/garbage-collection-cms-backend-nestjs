import { IClientRepository } from '../../../domain/interface/client.repository.interface';
import { Client } from '../../../domain/entities/client.entity';
import { ClientSchema } from '../schema/client.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PaymentMethod } from '../../../../building/domain/building.entity';

export class ClientRepository implements IClientRepository {
  constructor(
    @InjectRepository(ClientSchema)
    private readonly repository: Repository<ClientSchema>,
    // todo import the buidings Schema for getting the buidlings
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

  async findById(id: string): Promise<Client | null> {
    const schema = await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
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
  ): Promise<[Client[], number]> {
    const [schemas, total] = await this.repository.findAndCount({
      where: { deletedAt: IsNull() },
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
      paymentMethod: client.paymentMethod,
    };

    return this.repository.create(data);
  }

  toDomain(schema: ClientSchema) {
    // todo get the building herw
    const buildings = [];

    return Client.fromPersistence({
      id: schema.id,
      companyName: schema.companyName,
      KRAPin: schema.KRAPin,
      firstName: schema.firstName,
      lastName: schema.lastName,
      email: schema.email,
      phone: schema.phone,
      paymentMethod: schema.paymentMethod,
      buildings,
    });
  }
}
