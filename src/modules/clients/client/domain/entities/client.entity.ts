import { BadRequestException } from '@nestjs/common';
import { BaseEntity } from '../../../../../shared/domain/entities/base.entity';
import {
  Building,
  PaymentMethod,
} from '../../../building/domain/building.entity';

export class Client extends BaseEntity {
  // contacts
  private _firstName: string;
  private _lastName: string;
  private _email: string;
  private _phone: string;
  // company Details
  private _companyName: string;
  private _KRAPin: string;
  private _paymentMethod: PaymentMethod;

  private _buildings: Building[];

  constructor(props: {
    id?: string;
    companyName: string;
    KRAPin: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    paymentMethod: PaymentMethod;
    buildings: Building[];
  }) {
    super(props.id);
    this._companyName = props.companyName;
    this._KRAPin = props.KRAPin;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._email = props.email;
    this._phone = props.phone;
    this._paymentMethod = props.paymentMethod;

    this._buildings = props.buildings ? props.buildings : [];

    this.validate();
  }

  validate() {
    if (!this._companyName || this._companyName.trim().length === 0) {
      throw new BadRequestException('Company name is required');
    }

    if (!this._KRAPin || this._KRAPin.trim().length === 0) {
      throw new BadRequestException('KRA PIN is required');
    }

    if (!this._firstName || this._firstName.trim().length === 0) {
      throw new BadRequestException('First name is required');
    }

    if (!this._lastName || this._lastName.trim().length === 0) {
      throw new BadRequestException('Last name is required');
    }

    if (!this._email || this._email.trim().length === 0) {
      throw new BadRequestException('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this._email)) {
      throw new BadRequestException('Invalid email format');
    }

    if (!this._phone || this._phone.trim().length === 0) {
      throw new BadRequestException('Phone is required');
    }

    const phoneRegex = /^(?:\+254|0)[17]\d{8}$/;
    if (!phoneRegex.test(this._phone)) {
      throw new BadRequestException('Invalid Kenyan phone number format');
    }

    if (this._paymentMethod === undefined || this._paymentMethod === null) {
      throw new BadRequestException('PaymentMethod is required');
    }
    // TODO CHECK PAYMANT METHIDS TYPE
  }

  static create(props: {
    companyName: string;
    KRAPin: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    paymentMethod: PaymentMethod;
    buildings: Building[];
  }) {
    return new Client({
      companyName: props.companyName,
      KRAPin: props.KRAPin,
      firstName: props.firstName,
      lastName: props.lastName,
      email: props.email,
      phone: props.phone,
      paymentMethod: props.paymentMethod,
      buildings: props.buildings ? props.buildings : [],
    });
  }

  static fromPersistence(props: {
    id: string;
    companyName: string;
    KRAPin: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    paymentMethod: PaymentMethod;
    buildings: Building[];
  }) {
    return new Client(props);
  }

  update(props: {
    companyName?: string;
    KRAPin?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    paymentMethod: PaymentMethod;
    buildings?: Building[];
  }) {
    if (props.companyName !== undefined) this._companyName = props.companyName;
    if (props.KRAPin !== undefined) this._KRAPin = props.KRAPin;
    if (props.firstName !== undefined) this._firstName = props.firstName;
    if (props.lastName !== undefined) this._lastName = props.lastName;
    if (props.email !== undefined) this._email = props.email;
    if (props.phone !== undefined) this._phone = props.phone;
    if (props.paymentMethod !== undefined)
      this._paymentMethod = props.paymentMethod;
    if (props.buildings !== undefined) this._buildings = props.buildings;

    this.validate();
  }

  //   getters

  get firstName() {
    return this._firstName;
  }

  get lastName() {
    return this._lastName;
  }

  get email() {
    return this._email;
  }

  get phone() {
    return this._phone;
  }

  get companyName() {
    return this._companyName;
  }

  get KRAPin() {
    return this._KRAPin;
  }

  get buildings() {
    return this._buildings;
  }

  get paymentMethod() {
    return this._paymentMethod;
  }
}
