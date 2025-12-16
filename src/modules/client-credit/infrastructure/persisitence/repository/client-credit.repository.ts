import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ClientCredit } from 'src/modules/client-credit/domain/client-credit.entity';
import { Repository } from 'typeorm';
import { ClientCreditSchema } from '../schema/client-credit.schema';
import { ICreditClientRepository } from 'src/modules/client-credit/domain/client_credit.repository.interfacace';

export class ClientCreditRepository implements ICreditClientRepository {
  constructor(
    @InjectRepository(ClientCreditSchema)
    private readonly repository: Repository<ClientCreditSchema>,
  ) {}

  async save(clientCredit: ClientCredit): Promise<ClientCredit> {
    const schema = this.toSchema(clientCredit);
    const saved = await this.repository.save(schema);
    return this.toDomain(saved);
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
      client: schema.client,
      balance: schema.balance,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    });
  }
}
