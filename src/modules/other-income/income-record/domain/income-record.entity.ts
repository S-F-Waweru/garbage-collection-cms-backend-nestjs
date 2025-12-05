import { BaseEntity } from '../../../../shared/domain/entities/base.entity';
import { BadRequestException } from '@nestjs/common';
import { IncomeCategory } from '../../income-category/domain/income-category.entity';
import { Unit } from '../application/dto/income-record.dto';

export class IncomeRecord extends BaseEntity {
  private _category: IncomeCategory;
  private _clientName: string;
  private _unitPrice: number;
  private _unitCount: number;
  private _unitType: Unit;
  private _notes?: string;
  private _recordedBy: string; // logged in user ID
  private _recordedAt: Date;

  private constructor(props: {
    id?: string;
    category: IncomeCategory;
    clientName: string;
    unitPrice: number;
    unitCount: number;
    unitType: Unit;
    notes?: string;
    recordedBy: string;
    recordedAt?: Date;
  }) {
    super(props.id);
    this._category = props.category;
    this._clientName = props.clientName;
    this._unitPrice = props.unitPrice;
    this._unitCount = props.unitCount;
    this._unitType = props.unitType;
    this._notes = props.notes;
    this._recordedBy = props.recordedBy;
    this._recordedAt = props.recordedAt ?? new Date();
    this.validate();
  }

  get category(): IncomeCategory {
    return this._category;
  }

  get clientName(): string {
    return this._clientName;
  }

  get unitPrice(): number {
    return this._unitPrice;
  }

  get unitCount(): number {
    return this._unitCount;
  }

  get unitType(): Unit {
    return this._unitType;
  }

  get notes(): string | undefined {
    return this._notes;
  }

  get recordedBy(): string {
    return this._recordedBy;
  }

  get recordedAt(): Date {
    return this._recordedAt;
  }

  get totalAmount(): number {
    return this._unitPrice * this._unitCount;
  }

  static create(props: {
    category: IncomeCategory;
    clientName: string;
    unitPrice: number;
    unitCount: number;
    unitType: Unit;
    notes?: string;
    recordedBy: string;
  }): IncomeRecord {
    return new IncomeRecord({ ...props });
  }

  static fromPersistence(props: {
    id: string;
    category: IncomeCategory;
    clientName: string;
    unitPrice: number;
    unitCount: number;
    unitType: Unit;
    notes?: string;
    recordedBy: string;
    recordedAt: Date;
  }): IncomeRecord {
    return new IncomeRecord({ ...props });
  }

  private validate(): void {
    if (!this._category)
      throw new BadRequestException('Category must be provided');
    if (!this._clientName || this._clientName.trim().length === 0)
      throw new BadRequestException('Client name cannot be empty');
    if (this._unitPrice <= 0)
      throw new BadRequestException('Unit price must be greater than zero');
    if (this._unitCount <= 0)
      throw new BadRequestException('Unit count must be greater than zero');
    if (!this._unitType)
      throw new BadRequestException('Unit type must be specified');
    if (!this._recordedBy || this._recordedBy.trim().length === 0)
      throw new BadRequestException('RecordedBy (userId) is required');
  }

  // typescript
  update(props: {
    category?: IncomeCategory;
    clientName?: string;
    unitPrice?: number;
    unitCount?: number;
    unitType?: Unit;
    notes?: string;
  }): void {
    if (props.category !== undefined) this._category = props.category;
    if (props.clientName !== undefined) this._clientName = props.clientName;
    if (props.unitPrice !== undefined) this._unitPrice = props.unitPrice;
    if (props.unitCount !== undefined) this._unitCount = props.unitCount;
    if (props.unitType !== undefined) this._unitType = props.unitType;
    if (props.notes !== undefined) this._notes = props.notes;

    this.validate();
  }
}
