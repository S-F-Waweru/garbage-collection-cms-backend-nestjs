import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { ClientCredit } from 'src/modules/client-credit/domain/client-credit.entity';
import { Repository } from 'typeorm';
import { ClientCreditSchema } from '../schema/client-credit.schema';
import { ICreditClientRepository } from 'src/modules/client-credit/domain/client_credit.repository.interfacace';
import { ClientSchema } from '../../../../clients/client/infrastructure/perisistence/schema/client.schema';
import { Client } from '../../../../clients/client/domain/entities/client.entity';
import { Building } from '../../../../clients/building/domain/building.entity';

export class ClientCreditRepository implements ICreditClientRepository {
  constructor(
    @InjectRepository(ClientCreditSchema)
    private readonly repository: Repository<ClientCreditSchema>,
  ) {}
  private logger = new Logger(ClientCreditRepository.name);

  // async save(clientCredit: ClientCredit): Promise<ClientCredit> {
  //   const schema = this.toSchema(clientCredit);
  //   const saved = await this.repository.save(schema);
  //   return this.toDomain(saved);
  // }
  async save(clientCredit: ClientCredit): Promise<ClientCredit> {
    const schema = this.toSchema(clientCredit);

    // 1. Perform the save
    const saved = await this.repository.save(schema);

    // 2. Fetch the record again with relations to satisfy the mapper
    const fullSchema = await this.repository.findOne({
      where: { id: saved.id },
      relations: ['client'],
    });

    if (!fullSchema) {
      throw new Error('Failed to retrieve client credit after saving.');
    }

    // 3. Now toDomain will have the 'client' object it needs
    return this.toDomain(fullSchema);
  }

  async findById(id: string): Promise<ClientCredit | null> {
    const schema = await this.repository.findOne({
      where: { id },
      relations: ['client'],
    });

    return schema ? this.toDomain(schema) : null;
  }

  async findByClientId(clientId: string): Promise<ClientCredit | null> {
    const schema = await this.repository.findOne({
      where: { clientId },
      relations: ['client'],
    });

    return schema ? this.toDomain(schema) : null;
  }

  async incrementBalance(
    clientId: string,
    amount: number,
  ): Promise<ClientCredit> {
    const credit = await this.findByClientId(clientId);

    if (!credit) {
      throw new NotFoundException(
        `Client credit not found for client ${clientId}`,
      );
    }

    credit.incrementBalance(amount);
    return this.save(credit);
  }

  async decrementBalance(
    clientId: string,
    amount: number,
  ): Promise<ClientCredit> {
    const credit = await this.findByClientId(clientId);

    if (!credit) {
      throw new NotFoundException(
        `Client credit not found for client ${clientId}`,
      );
    }

    credit.decrementBalance(amount);
    return this.save(credit);
  }

  async updateBalance(
    clientId: string,
    newBalance: number,
  ): Promise<ClientCredit> {
    const credit = await this.findByClientId(clientId);

    if (!credit) {
      throw new NotFoundException(
        `Client credit not found for client ${clientId}`,
      );
    }

    credit.updateBalance(newBalance);
    return this.save(credit);
  }

  async exists(clientId: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { clientId },
    });

    return count > 0;
  }

  private toSchema(clientCredit: ClientCredit): ClientCreditSchema {
    const schema = new ClientCreditSchema();

    if (clientCredit.id) {
      schema.id = clientCredit.id;
    }

    schema.clientId = clientCredit.client.id;
    schema.balance = clientCredit.balance;

    return schema;
  }

  private toDomain(schema: ClientCreditSchema): ClientCredit {
    return ClientCredit.fromPersistence({
      id: schema.id,
      client: this.mapClientToDomain(schema.client), // CONVERT HERE
      balance: schema.balance,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    });
  }

  private mapClientToDomain(schema: ClientSchema): Client {
    return Client.fromPersistence({
      id: schema.id,
      companyName: schema.companyName,
      KRAPin: schema.KRAPin,
      firstName: schema.firstName,
      lastName: schema.lastName,
      email: schema.email,
      phone: schema.phone,
      paymentMethod: schema.paymentMethod,
      billingDate: schema.billingDate,
      buildings: [],
    });
  }
}
