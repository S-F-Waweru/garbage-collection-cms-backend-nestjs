import { BadRequestException } from '@nestjs/common';
import { Client } from 'src/modules/clients/client/domain/entities/client.entity';
import { BaseEntity } from 'src/shared/domain/entities/base.entity';

export class ClientCredit extends BaseEntity {
  private _client: Client;
  private _balanceCents: number; // store in cents

  constructor(
    props: { id?: string; client: Client; balance: number },
    skipValidation = false,
  ) {
    super(props.id);
    this._client = props.client;
    // convert to cents for internal storage
    this._balanceCents = Math.round((props.balance || 0) * 100);

    if (!skipValidation) {
      this.validate();
    }
  }

  validate() {
    if (this._balanceCents < 0) {
      throw new BadRequestException('Balance cannot be negative');
    }
    if (isNaN(this._balanceCents)) {
      throw new BadRequestException('Balance must be a valid number');
    }
    if (!this.id && !this._client) {
      throw new BadRequestException('Client is required');
    }
  }

  static create(props: { client: Client; balance?: number }) {
    return new ClientCredit({
      client: props.client,
      balance: props.balance || 0,
    });
  }

  static fromPersistence(props: {
    id: string;
    client: Client;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    const credit = new ClientCredit(
      {
        id: props.id,
        client: props.client,
        balance: props.balance,
      },
      true, // skip validation for persisted
    );
    credit._createdAt = props.createdAt;
    credit._updatedAt = props.updatedAt;
    return credit;
  }

  updateBalance(amount: number) {
    if (amount < 0) {
      throw new BadRequestException('Balance cannot be negative');
    }
    this._balanceCents = Math.round(amount * 100);
    this.validate();
  }

  incrementBalance(amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Increment amount must be positive');
    }
    this._balanceCents += Math.round(amount * 100);
    this.validate();
  }

  decrementBalance(amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Decrement amount must be positive');
    }
    const decrementCents = Math.round(amount * 100);
    if (this._balanceCents < decrementCents) {
      throw new BadRequestException('Insufficient credit balance');
    }
    this._balanceCents -= decrementCents;
    this.validate();
  }

  // Get balance in decimal for display
  get balance(): number {
    return this._balanceCents / 100;
  }

  get client(): Client {
    return this._client;
  }
}
