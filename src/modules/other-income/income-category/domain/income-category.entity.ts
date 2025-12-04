import { BaseEntity } from '../../../../shared/domain/entities/base.entity';
import { BadRequestException } from '@nestjs/common';

export class IncomeCategory extends BaseEntity {
  private _name: string;
  private _description?: string;

  // Private constructor, id optional because BaseEntity handles it
  private constructor(props: {
    id?: string;
    name: string;
    description?: string;
  }) {
    super(props.id); // BaseEntity generates id if undefined
    this._name = props.name;
    this._description = props.description;
    this.validate();
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get description(): string | undefined {
    return this._description;
  }

  // Factory method for new domain objects
  static create(props: { name: string; description?: string }): IncomeCategory {
    return new IncomeCategory({
      name: props.name,
      description: props.description,
    });
  }

  // Hydration from persistence layer (DB)
  static fromPersistence(props: {
    id: string;
    name: string;
    description?: string;
  }): IncomeCategory {
    return new IncomeCategory({
      id: props.id,
      name: props.name,
      description: props.description,
    });
  }

  // Domain validation
  private validate(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new BadRequestException('Income category name cannot be empty');
    }
  }

  updateDetails(name: string, description?: string): void {
    if (!name || name.trim().length === 0) {
      throw new BadRequestException('Income category name cannot be empty');
    }
    this._name = name;
    this._description = description;
  }
}
