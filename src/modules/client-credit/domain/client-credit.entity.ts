import { BadRequestException } from '@nestjs/common';
import { Client } from 'src/modules/clients/client/domain/entities/client.entity';
import { BaseEntity } from 'src/shared/domain/entities/base.entity';

export class ClientCredit extends BaseEntity {
  
    private _client: Client;
    private _balance: number;

    constructor(props: { id?: string; client: Client; balance: number }) {
        super(props.id);
        this._client = props.client;
        this._balance = props.balance || 0;

        this.validate();
    }

    validate() {
        // Validate client exists
        if (!this._client) {
            throw new BadRequestException('Client is required');
        }

        // Validate balance is not negative
        if (this._balance < 0) {
            throw new BadRequestException('Balance cannot be negative');
        }

        // Validate balance is a valid number
        if (isNaN(this._balance)) {
            throw new BadRequestException('Balance must be a valid number');
        }
    }

    static create(props: {
        client: Client;
        balance?: number;
    }) {
        return new ClientCredit({
            client: props.client,
            balance: props.balance || 0
        });
    }

    static fromPersistence(props: {
        id: string;
        client: Client;
        balance: number;
        createdAt: Date;
        updatedAt: Date;
    }) {
        const credit = new ClientCredit({
            id: props.id,
            client: props.client,
            balance: props.balance
        });

        return credit;
    }

    updateBalance(amount: number) {
        if (amount < 0) {
            throw new BadRequestException('The amount cannot be a negative amount');
        }

        this._balance = amount;
        this.validate();
    }

    incrementBalance(amount: number) {
        if (amount <= 0) {
            throw new BadRequestException('Increment amount must be positive');
        }

        this._balance += amount;
        this.validate();
    }

    decrementBalance(amount: number) {
        if (amount <= 0) {
            throw new BadRequestException('Decrement amount must be positive');
        }

        if (this._balance < amount) {
            throw new BadRequestException('Insufficient credit balance');
        }

        this._balance -= amount;
        this.validate();
    }

    // Getters
    get balance() {
        return this._balance;
    }

    get client() {
        return this._client;
    }
}