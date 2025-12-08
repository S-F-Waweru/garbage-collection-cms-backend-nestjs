import { BadRequestException } from '@nestjs/common';
import { BaseEntity } from '../../../../shared/domain/entities/base.entity';
import { Client } from '../../client/domain/entities/client.entity';
import { Location } from '../../../location/domain/entities/location.entity';

export enum PaymentMethod {
  CASH = 'CASH',
  MPESA = 'MPESA',
  BANK = 'BANK',
}

export class Building extends BaseEntity {
  private _name: string;
  private _location: Location;
  private _client: Client;
  private _unitPrice: number;
  private _unitCount: number;

  constructor(props: {
    id?: string;
    name: string;
    location: Location;
    client: Client;
    unitPrice: number;
    unitCount: number;
  }) {
    super(props.id);
    this._name = props.name;
    this._location = props.location;
    this._client = props.client;
    this._unitCount = props.unitCount;
    this._unitPrice = props.unitPrice;
    this.validate();
  }

  validate() {
    if (!this._name || this._name.trim().length === 0) {
      throw new BadRequestException('Building name is required');
    }

    if (!this._location) {
      throw new BadRequestException('Location is required');
    }

    if (!this._client) {
      throw new BadRequestException('Client is required');
    }

    if (this._unitPrice === undefined || this._unitPrice === null) {
      throw new BadRequestException('Unit price is required');
    }

    if (this._unitPrice < 0) {
      throw new BadRequestException('Unit price must be a positive number');
    }

    if (this._unitCount === undefined || this._unitCount === null) {
      throw new BadRequestException('Unit count is required');
    }

    if (this._unitCount < 0 || !Number.isInteger(this._unitCount)) {
      throw new BadRequestException('Unit count must be a positive integer');
    }
  }

  static create(props: {
    name: string;
    location: Location;
    client: Client;
    unitPrice: number;
    unitCount: number;
  }) {
    return new Building({
      name: props.name,
      location: props.location,
      client: props.client,
      unitCount: props.unitCount,
      unitPrice: props.unitPrice,
    });
  }

  static fromPersistence(props: {
    id: string;
    name: string;
    location: Location;
    client: Client;
    unitPrice: number;
    unitCount: number;
  }) {
    return new Building(props);
  }

  update(props: {
    name?: string;
    location?: Location;
    client?: Client;
    unitCount?: number;
    unitPrice?: number;
  }) {
    if (props.name !== undefined) this._name = props.name;
    if (props.location !== undefined) this._location = props.location;
    if (props.client !== undefined) this._client = props.client;
    if (props.unitCount !== undefined) this._unitCount = props.unitCount;
    if (props.unitPrice !== undefined) this._unitPrice = props.unitPrice;

    this.validate();
  }

  // Getters
  get name() {
    return this._name;
  }

  get location() {
    return this._location;
  }

  get client() {
    return this._client;
  }

  get unitPrice() {
    return this._unitPrice;
  }

  get unitCount() {
    return this._unitCount;
  }
}
