import { BadRequestException } from '@nestjs/common';
import { BaseEntity } from '../../../../shared/domain/entities/base.entity';

export class Location extends BaseEntity {
  private _city: string;
  private _region: string;
  constructor(props: { id?: string; city: string; region: string }) {
    super(props.id);
    this._city = props.city;
    this._region = props.region;
    this.validate();
  }

  validate() {
    if (!this._city) {
      throw new BadRequestException('City is required');
    }
    if (!this._region) {
      throw new BadRequestException('Region is required');
    }
  }

  static create(props: { city: string; region: string }): Location {
    return new Location({
      city: props.city,
      region: props.region,
    });
  }

  static fromPersistence(props: {
    id: string;
    city: string;
    region: string;
  }): Location {
    return new Location({
      id: props.id,
      city: props.city,
      region: props.region,
    });
  }

  updateLocation(city: string, region: string) {
    this._city = city;
    this._region = region;
    this.validate();
  }

  get city(): string {
    return this._city;
  }

  get region(): string {
    return this._region;
  }
}
