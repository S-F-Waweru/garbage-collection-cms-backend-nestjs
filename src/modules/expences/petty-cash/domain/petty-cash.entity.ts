// typescript
import { BaseEntity } from '../../../../shared/domain/entities/base.entity';
import { BadRequestException } from '@nestjs/common';
import { IncomeSource } from '../application/dto/petty-cash.dto';

export class PettyCash extends BaseEntity {
  private _name: string;
  private _totalAmount: number;
  private _createdBy: string;
  private _notes: string;
  private _incomeSource: IncomeSource;

  constructor(props: {
    id?: string;
    name: string;
    totalAmount: number;
    createdBy: string;
    incomeSource: IncomeSource;
    notes?: string;
  }) {
    super(props.id);
    this._name = props.name;
    this._totalAmount = props.totalAmount;
    this._createdBy = props.createdBy;
    this._notes = props.notes ?? '';
    this.validate();
  }

  static create(
    name: string,
    totalAmount: number,
    createdBy: string,
    incomeSource: IncomeSource,
    notes?: string,
  ): PettyCash {
    return new PettyCash({
      name,
      totalAmount,
      createdBy,
      incomeSource,
      notes: notes ?? '',
    });
  }

  static fromPersistence(props: {
    id: string;
    name: string;
    totalAmount: number;
    createdBy: string;
    incomeSource: IncomeSource;
    notes?: string;
  }): PettyCash {
    return new PettyCash({
      id: props.id,
      name: props.name,
      totalAmount: props.totalAmount,
      createdBy: props.createdBy,
      incomeSource: props.incomeSource,
      notes: props.notes,
    });
  }

  validate(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new BadRequestException('Petty Cash name is required');
    }
    if (this._totalAmount < 0) {
      throw new BadRequestException('Total Amount cannot be negative');
    }
    if (!this._createdBy || this._createdBy.trim().length === 0) {
      throw new BadRequestException('Created By is required');
    }
  }

  update(props: { name?: string; totalAmount?: number; notes?: string }): void {
    if (props.name !== undefined) {
      this._name = props.name;
    }
    if (props.totalAmount !== undefined) {
      if (props.totalAmount < 0) {
        throw new BadRequestException('Total Amount cannot be negative');
      }
      this._totalAmount = props.totalAmount;
    }
    if (props.notes !== undefined) {
      this._notes = props.notes;
    }
    this.validate();
  }
  // getters
  get name(): string {
    return this._name;
  }

  get totalAmount(): number {
    return this._totalAmount;
  }

  get createdBy(): string {
    return this._createdBy;
  }

  get notes(): string {
    return this._notes;
  }
}
