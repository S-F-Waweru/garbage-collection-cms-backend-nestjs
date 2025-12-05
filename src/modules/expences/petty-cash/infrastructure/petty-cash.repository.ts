// typescript
import { IPettyCashRepository } from '../domain/interfaces/petty-cash.repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PettyCashSchema } from './petty-cash-schema';
import { PettyCash } from '../domain/petty-cash.entity';
import { Injectable } from '@nestjs/common';
import { IncomeCategory } from '../../../other-income/income-category/domain/income-category.entity';

@Injectable()
export class PettyCashRepository implements IPettyCashRepository {
  constructor(
    @InjectRepository(PettyCashSchema)
    private readonly repository: Repository<PettyCashSchema>,
  ) {}

  private toSchema(pettyCash: PettyCash): Partial<PettyCashSchema> {
    return {
      id: pettyCash.id,
      name: pettyCash.name,
      totalAmount: pettyCash.totalAmount,
      notes: pettyCash.notes,
    };
  }

  private toDomain(schema: PettyCashSchema): PettyCash {
    return PettyCash.fromPersistence({
      id: schema.id,
      name: schema.name,
      totalAmount: schema.totalAmount,
      notes: schema.notes,
    });
  }

  save(pettyCash: PettyCash) {
    const schema = this.toSchema(pettyCash);
    const saved = await this.repository.save(schema);
    return this.toDomain(saved);
  }
  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { id },
    });

    return count > 0;
  }

  async findAll(): Promise<IncomeCategory[]> {
    const schemas = await this.repository.find({
      where: { deletedAt: IsNull() },
    });
    return schemas.map((s) => this.toDomain(s));
  }

  findById(id: string): Promise<PettyCash | null> {
    const schema = await this.repository.findOne({ where: { id } });
    return schema ? this.toDomain(schema) : null;
  }
}
