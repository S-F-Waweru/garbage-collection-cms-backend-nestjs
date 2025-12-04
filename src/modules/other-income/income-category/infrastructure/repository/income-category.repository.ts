import { Injectable } from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IncomeCategorySchema } from '../schema/IncomeCategory.schema';
import { IncomeCategory } from '../../domain/income-category.entity';
import { IIncomeCategoryRepository } from '../../domain/interfaces/income-category.repository.interface';

@Injectable()
export class IncomeCategoryRepository implements IIncomeCategoryRepository {
  constructor(
    @InjectRepository(IncomeCategorySchema)
    private readonly repository: Repository<IncomeCategorySchema>,
  ) {}

  /** Map schema → domain entity */
  private toDomain(schema: IncomeCategorySchema): IncomeCategory {
    return IncomeCategory.fromPersistence({
      id: schema.id,
      name: schema.name,
      description: schema.description,
    });
  }

  /** Map domain entity → schema */
  private toSchema(entity: IncomeCategory): Partial<IncomeCategorySchema> {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
    };
  }

  async findById(id: string): Promise<IncomeCategory | null> {
    const schema = await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    return schema ? this.toDomain(schema) : null;
  }

  async findByName(name: string): Promise<IncomeCategory | null> {
    const schema = await this.repository.findOne({
      where: { name, deletedAt: IsNull() },
    });
    return schema ? this.toDomain(schema) : null;
  }

  async findAll(): Promise<IncomeCategory[]> {
    const schemas = await this.repository.find({
      where: { deletedAt: IsNull() },
    });
    return schemas.map((s) => this.toDomain(s));
  }

  async save(category: IncomeCategory): Promise<IncomeCategory> {
    const schema = this.repository.create(this.toSchema(category));
    const saved = await this.repository.save(schema);
    return this.toDomain(saved);
  }

  async exists(name: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { name, deletedAt: IsNull() },
    });
    return count > 0;
  }

  async update(category: IncomeCategory): Promise<IncomeCategory> {
    await this.repository.update(category.id, this.toSchema(category));
    const updated = await this.repository.findOne({
      where: { id: category.id, deletedAt: IsNull() },
    });
    return updated ? this.toDomain(updated) : category;
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id); // soft delete
  }
}
