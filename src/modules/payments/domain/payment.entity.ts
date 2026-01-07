// domain/payment.entity.ts
import { BaseEntity } from 'src/shared/domain/entities/base.entity';
import { BadRequestException } from '@nestjs/common';
import { Client } from '../../clients/client/domain/entities/client.entity';

export enum PaymentMethod {
  BANK = 'BANK',
  MPESA = 'MPESA',
  CASH = 'CASH',
  CUSTOM = 'CUSTOM',
}

interface PaymentProps {
  paymentNumber: string;
  clientId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  referenceNumber?: string;
  notes?: string;
  createdBy: string;

  // Payment application tracking
  appliedToInvoices?: PaymentApplication[];
  excessAmount?: number;

  // Relationships (optional - loaded separately)
  client?: Client;
  creator?: any;
}

export interface PaymentApplication {
  invoiceId: string;
  invoiceNumber: string;
  amountApplied: number;
}

export class Payment extends BaseEntity {
  private _paymentNumber: string;
  private _clientId: string;
  private _amount: number;
  private _paymentMethod: PaymentMethod;
  private _paymentDate: Date;
  private _referenceNumber?: string;
  private _notes?: string;
  private _createdBy: string;
  private _appliedToInvoices: PaymentApplication[];
  private _excessAmount: number;
  private _clientName?: string;

  // Relationships
  private _client?: Client;
  private _creator?: any;

  private constructor(props: PaymentProps, id?: string) {
    super(id);
    this._paymentNumber = props.paymentNumber;
    this._clientId = props.clientId;
    this._amount = props.amount;
    this._paymentMethod = props.paymentMethod;
    this._paymentDate = props.paymentDate;
    this._referenceNumber = props.referenceNumber;
    this._notes = props.notes;
    this._createdBy = props.createdBy;
    this._appliedToInvoices = props.appliedToInvoices || [];
    this._excessAmount = props.excessAmount || 0;
    this._client = props.client;
    this._creator = props.creator;
  }

  // Getters
  get paymentNumber(): string {
    return this._paymentNumber;
  }

  get clientId(): string {
    return this._clientId;
  }

  get amount(): number {
    return this._amount;
  }

  get paymentMethod(): PaymentMethod {
    return this._paymentMethod;
  }

  get paymentDate(): Date {
    return this._paymentDate;
  }

  get referenceNumber(): string | undefined {
    return this._referenceNumber;
  }

  get notes(): string | undefined {
    return this._notes;
  }

  get createdBy(): string {
    return this._createdBy;
  }

  get appliedToInvoices(): PaymentApplication[] {
    return this._appliedToInvoices;
  }

  get excessAmount(): number {
    return this._excessAmount;
  }

  get client(): any {
    return this._client;
  }

  get creator(): any {
    return this._creator;
  }

  get totalApplied(): number {
    return this._appliedToInvoices.reduce(
      (sum, app) => sum + app.amountApplied,
      0,
    );
  }

  // Relationship setters
  setClient(client: Client): void {
    this._client = client;
  }
  setCreator(creator: any): void {
    this._creator = creator;
  }

  // Factory methods
  static create(props: PaymentProps): Payment {
    const payment = new Payment(props);
    //todo return this
    // payment.validate();
    return payment;
  }

  static createFromPersistence(
    props: PaymentProps & { id: string; createdAt: Date; updatedAt: Date },
  ): Payment {
    const payment = new Payment(props, props.id);
    payment._createdAt = props.createdAt;
    payment._updatedAt = props.updatedAt;
    // payment.validate();
    return payment;
  }

  // Validation
  private validate(): void {
    if (!this._paymentNumber || this._paymentNumber.trim() === '') {
      throw new BadRequestException('Payment number is required');
    }

    if (!this._clientId) {
      throw new BadRequestException('Client ID is required');
    }

    if (this._amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than 0');
    }

    if (!this._paymentMethod) {
      throw new BadRequestException('Payment method is required');
    }

    if (!this._paymentDate) {
      throw new BadRequestException('Payment date is required');
    }

    if (!this._createdBy) {
      throw new BadRequestException('Created by user is required');
    }

    if (this._excessAmount < 0) {
      throw new BadRequestException('Excess amount cannot be negative');
    }

    // /todo return this
    // Validate total applied doesn't exceed payment amount
    // const totalApplied = this.totalApplied;
    // if (totalApplied + this._excessAmount !== this._amount) {
    //   throw new BadRequestException(
    //     'Total applied + excess must equal payment amount',
    //   );
    // }
  }

  // Business logic
  addInvoiceApplication(
    invoiceId: string,
    invoiceNumber: string,
    amountApplied: number,
  ): void {
    if (amountApplied <= 0) {
      throw new BadRequestException('Applied amount must be greater than 0');
    }

    const currentTotal = this.totalApplied + this._excessAmount;
    if (currentTotal + amountApplied > this._amount) {
      throw new BadRequestException('Cannot apply more than payment amount');
    }

    this._appliedToInvoices.push({
      invoiceId,
      invoiceNumber,
      amountApplied,
    });

    this.touch();
  }

  setExcessAmount(amount: number): void {
    if (amount < 0) {
      throw new BadRequestException('Excess amount cannot be negative');
    }

    const totalApplied = this.totalApplied;
    // todo retrun this
    // if (totalApplied + amount !== this._amount) {
    //   throw new BadRequestException(
    //     'Total applied + excess must equal payment amount',
    //   );
    // }

    this._excessAmount = amount;
    this.touch();
  }

  isFullyApplied(): boolean {
    return this.totalApplied + this._excessAmount === this._amount;
  }

  hasExcess(): boolean {
    return this._excessAmount > 0;
  }

  // Serialization
  toObject() {
    return {
      id: this._id,
      paymentNumber: this._paymentNumber,
      clientId: this._clientId,
      amount: this._amount,
      paymentMethod: this._paymentMethod,
      paymentDate: this._paymentDate,
      referenceNumber: this._referenceNumber,
      notes: this._notes,
      createdBy: this._createdBy,
      appliedToInvoices: this._appliedToInvoices,
      excessAmount: this._excessAmount,
      totalApplied: this.totalApplied,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      ...(this._client && { client: this._client }),
      ...(this._creator && { creator: this._creator }),
    };
  }
}
