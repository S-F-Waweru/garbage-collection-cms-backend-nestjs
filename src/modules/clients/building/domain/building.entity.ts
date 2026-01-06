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
  private _activeUnits: number;
  private _binsAssigned: number;
  private _totalPrice: number;

  constructor(props: {
    id?: string;
    name: string;
    location: Location;
    client: Client;
    unitPrice: number;
    unitCount: number;
    activeUnits?: number;
    binsAssigned?: number;
  }) {
    super(props.id);
    this._name = props.name;
    this._location = props.location;
    this._client = props.client;
    this._unitCount = props.unitCount;
    this._unitPrice = props.unitPrice;
    this._activeUnits = props.activeUnits || 0;
    this._binsAssigned =
      props.binsAssigned !== undefined ? props.binsAssigned : 3; // Default to 3
    this._totalPrice = this.calculateTotalPrice();
    this.validate();
  }

  private calculateTotalPrice(): number {
    return this._activeUnits * this._unitPrice;
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

    if (this._activeUnits < 0 || !Number.isInteger(this._activeUnits)) {
      throw new BadRequestException('Active units must be a positive integer');
    }

    if (this._activeUnits > this._unitCount) {
      throw new BadRequestException(
        'Active units cannot exceed total unit count',
      );
    }

    if (this._binsAssigned < 0 || !Number.isInteger(this._binsAssigned)) {
      throw new BadRequestException('Assigned bins must be a positive integer');
    }
  }

  static create(props: {
    name: string;
    location: Location;
    client: Client;
    unitPrice: number;
    unitCount: number;
    activeUnits?: number;
    binsAssigned?: number;
  }) {
    return new Building({
      name: props.name,
      location: props.location,
      client: props.client,
      unitCount: props.unitCount,
      unitPrice: props.unitPrice,
      activeUnits: props.activeUnits,
      binsAssigned: props.binsAssigned,
    });
  }

  static fromPersistence(props: {
    id: string;
    name: string;
    location: Location;
    client: Client;
    unitPrice: number;
    unitCount: number;
    activeUnits?: number;
    binsAssigned?: number;
  }) {
    return new Building(props);
  }

  update(props: {
    name?: string;
    location?: Location;
    client?: Client;
    unitCount?: number;
    unitPrice?: number;
    activeUnits?: number;
    binsAssigned?: number;
  }) {
    if (props.name !== undefined) this._name = props.name;
    if (props.location !== undefined) this._location = props.location;
    if (props.client !== undefined) this._client = props.client;
    if (props.unitCount !== undefined) this._unitCount = props.unitCount;
    if (props.unitPrice !== undefined) this._unitPrice = props.unitPrice;
    if (props.activeUnits !== undefined) this._activeUnits = props.activeUnits;
    if (props.binsAssigned !== undefined)
      this._binsAssigned = props.binsAssigned;

    // Recalculate total price when unit price or active units change
    if (props.unitPrice !== undefined || props.activeUnits !== undefined) {
      this._totalPrice = this.calculateTotalPrice();
    }

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

  get activeUnits() {
    return this._activeUnits;
  }

  get binsAssigned() {
    return this._binsAssigned;
  }

  get totalPrice() {
    return this._totalPrice;
  }

  // Setters for controlled modifications
  setActiveUnits(activeUnits: number) {
    this._activeUnits = activeUnits;
    this._totalPrice = this.calculateTotalPrice();
    this.validate();
  }

  setbinsAssigned(binsAssigned: number) {
    this._binsAssigned = binsAssigned;
    this.validate();
  }

  setUnitPrice(unitPrice: number) {
    this._unitPrice = unitPrice;
    this._totalPrice = this.calculateTotalPrice();
    this.validate();
  }
}
