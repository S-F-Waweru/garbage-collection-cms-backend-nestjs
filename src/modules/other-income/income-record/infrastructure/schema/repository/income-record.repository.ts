// TypeScript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { IIncomeRecordRepository } from '../../../domain/interface/income-record.repository.interface';
import { IncomeCategorySchema } from '../../../../income-category/infrastructure/schema/IncomeCategory.schema';
import { IncomeRecord } from '../../../domain/income-record.entity';
import { IncomeCategory } from '../../../../income-category/domain/income-category.entity';
import { IncomeRecordSchema } from '../income-record.schema';
import { Unit } from '../../../application/dto/income-record.dto';

// todo return more user fliendly data for the APIs
@Injectable()
export class IncomeRecordRepository implements IIncomeRecordRepository {
  constructor(
    @InjectRepository(IncomeRecordSchema)
    private readonly repository: Repository<IncomeRecordSchema>,

    @InjectRepository(IncomeCategorySchema)
    private readonly categoryRepository: Repository<IncomeCategorySchema>,
  ) {}

  // -------------------------------
  // Helpers: Mapping Layer
  // -------------------------------

  private async toSchema(record: IncomeRecord): Promise<IncomeRecordSchema> {
    const category = await this.categoryRepository.findOne({
      where: { id: record.category.id, deletedAt: IsNull() },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const schema: IncomeRecordSchema = this.repository.create({
      id: record.id, // optional for create, required for update
      notes: record.notes,
      unitType: record.unitType,
      unitCount: record.unitCount,
      clientName: record.clientName,
      category, // now definitely not undefined
      recordedBy: record.recordedBy,
      recordedAt: record.recordedAt,
    });

    return schema;
  }

  private toDomain(schema: IncomeRecordSchema): IncomeRecord {
    return IncomeRecord.fromPersistence({
      id: schema.id,
      unitPrice: Number(schema.unitPrice),
      notes: schema.notes,
      unitType: schema.unitType as unknown as Unit,
      unitCount: schema.unitCount,
      clientName: schema.clientName,
      recordedBy: schema.recordedBy,
      recordedAt: schema.recordedAt,
      category: this.toCategoryDomain(schema.category),
    });
  }

  // -------------------------------
  // Repository Methods
  // -------------------------------

  async findById(id: string): Promise<IncomeRecord | null> {
    const schema = await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['category'],
    });

    return schema ? this.toDomain(schema) : null;
  }

  async findAll(): Promise<IncomeRecord[]> {
    const schemas = await this.repository.find({
      where: { deletedAt: IsNull() },
      relations: ['category'],
    });

    return schemas.map((s) => this.toDomain(s));
  }

  async findByCategory(categoryId: string): Promise<IncomeRecord[]> {
    const schemas = await this.repository.find({
      where: { category: { id: categoryId }, deletedAt: IsNull() },
      relations: ['category'],
    });

    return schemas.map((s) => this.toDomain(s));
  }

  async save(record: IncomeRecord): Promise<IncomeRecord> {
    const schema = await this.toSchema(record);
    const saved = await this.repository.save(schema);
    return this.toDomain(saved);
  }

  async update(record: IncomeRecord): Promise<IncomeRecord> {
    const schema = await this.toSchema(record);
    await this.repository.save(schema);

    const updated = await this.repository.findOne({
      where: { id: record.id, deletedAt: IsNull() },
      relations: ['category'],
    });

    return updated ? this.toDomain(updated) : record;
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { id, deletedAt: IsNull() },
    });

    return count > 0;
  }

  private toCategoryDomain(schema: IncomeCategorySchema) {
    return IncomeCategory.fromPersistence({
      id: schema.id,
      name: schema.name,
      description: schema.description,
    });
  }
}
