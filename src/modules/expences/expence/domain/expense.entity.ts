import { BaseEntity } from '../../../../shared/domain/entities/base.entity';
import { PettyCash } from '../../petty-cash/domain/petty-cash.entity';
import { BadRequestException } from '@nestjs/common';

export class Expense extends BaseEntity {
  private _pettyCash: PettyCash;
  private _description: string;
  private _amount: number;
  private _expenseDate: Date;
  private _recordedBy: string;
  private _notes: string;
  private _category: string;

  constructor(props: {
    id?: string;
    pettyCash: PettyCash;
    description: string;
    amount: number;
    expenseDate: Date;
    category: string;
    recordedBy: string;
    notes?: string;
  }) {
    super(props.id);
    this._pettyCash = props.pettyCash;
    this._description = props.description;
    this._amount = props.amount;
    this._expenseDate = props.expenseDate;
    this._recordedBy = props.recordedBy;
    this._notes = props.notes ?? '';
    this._category = props.category;

    this.validate();
  }

  static create(props: {
    pettyCash: PettyCash;
    description: string;
    amount: number;
    expenseDate: Date;
    recordedBy: string;
    category: string;
    notes?: string;
  }): Expense {
    return new Expense({
      pettyCash: props.pettyCash,
      description: props.description,
      amount: props.amount,
      expenseDate: props.expenseDate,
      recordedBy: props.recordedBy,
      category: props.category,
      notes: props.notes ?? '',
    });
  }

  static fromPersistence(props: {
    id: string;
    pettyCash: PettyCash;
    description: string;
    amount: number;
    expenseDate: Date;
    category: string;
    recordedBy: string;
    notes?: string;
  }): Expense {
    return new Expense({
      id: props.id,
      pettyCash: props.pettyCash,
      description: props.description,
      amount: props.amount,
      expenseDate: props.expenseDate,
      recordedBy: props.recordedBy,
      category: props.category,
      notes: props.notes,
    });
  }

  validate(): void {
    if (!this._description || this._description.trim().length === 0) {
      throw new BadRequestException('Expense description is required');
    }
    if (this._amount < 0) {
      throw new BadRequestException('Expense amount cannot be negative');
    }
    if (!this._recordedBy || this._recordedBy.trim().length === 0) {
      throw new BadRequestException('Recorded By is required');
    }
  }

  update(props: {
    pettyCash?: PettyCash;
    description?: string;
    amount?: number;
    expenseDate?: Date;
    category?: string;
    recordedBy?: string;
    notes?: string;
  }) {
    if (props.pettyCash) this._pettyCash = props.pettyCash;
    if (props.description) this._description = props.description;
    if (props.amount !== undefined) this._amount = props.amount;
    if (props.expenseDate) this._expenseDate = props.expenseDate;
    if (props.recordedBy) this._recordedBy = props.recordedBy;
    if (props.notes !== undefined) this._notes = props.notes;
    if (props.category) this._category = props.category;

    this.validate();
  }

  get pettyCash(): PettyCash {
    return this._pettyCash;
  }

  get description(): string {
    return this._description;
  }
  get amount(): number {
    return this._amount;
  }
  get expenseDate(): Date {
    return this._expenseDate;
  }
  get category(): string {
    return this._category;
  }
  get recordedBy(): string {
    return this._recordedBy;
  }
  get notes(): string {
    return this._notes;
  }
}
