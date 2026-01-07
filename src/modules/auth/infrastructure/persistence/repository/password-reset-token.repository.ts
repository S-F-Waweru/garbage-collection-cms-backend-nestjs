import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordResetToken } from 'src/modules/auth/domain/entities/PasswordResetToken.entity';
import { IPasswordResetTokenRepository } from 'src/modules/auth/domain/interfaces/password.reposiory.interface';
import { Repository, LessThan } from 'typeorm';
import { PasswordResetTokenSchema } from '../schema/password-reset-schema';

@Injectable()
export class PasswordResetTokenRepository implements IPasswordResetTokenRepository {
  constructor(
    @InjectRepository(PasswordResetTokenSchema)
    private readonly repository: Repository<PasswordResetTokenSchema>,
  ) {}

  async findById(id: string): Promise<PasswordResetToken | null> {
    const schema = await this.repository.findOne({ where: { id } });
    return schema ? this.toDomain(schema) : null;
  }

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    const schema = await this.repository.findOne({
      where: { token },
    });
    return schema ? this.toDomain(schema) : null;
  }

  async findByUserId(userId: string): Promise<PasswordResetToken[]> {
    const schemas = await this.repository.find({
      where: { userId },
    });
    return schemas.map((schema) => this.toDomain(schema));
  }

  async save(token: PasswordResetToken): Promise<PasswordResetToken> {
    const schema = this.toSchema(token);
    const saved = await this.repository.save(schema);
    return this.toDomain(saved);
  }

  async update(token: PasswordResetToken): Promise<PasswordResetToken> {
    const schema = this.toSchema(token);
    await this.repository.update(token.id, schema);
    const updated = await this.repository.findOne({ where: { id: token.id } });
    return this.toDomain(updated!);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.repository.delete({ userId });
  }

  async deleteExpiredTokens(): Promise<void> {
    await this.repository.delete({
      expiresAt: LessThan(new Date()),
    });
  }

  // Mapper: Database Schema → Domain Entity
  private toDomain(schema: PasswordResetTokenSchema): PasswordResetToken {
    return PasswordResetToken.fromPersistence({
      id: schema.id,
      token: schema.token,
      userId: schema.userId,
      expiresAt: schema.expiresAt,
      isUsed: schema.isUsed,
      usedAt: schema.usedAt,
    });
  }

  // Mapper: Domain Entity → Database Schema
  private toSchema(
    token: PasswordResetToken,
  ): Partial<PasswordResetTokenSchema> {
    return {
      id: token.id,
      token: token.token,
      userId: token.userId,
      expiresAt: token.expiresAt,
      isUsed: token.isUsed,
      usedAt: token.usedAt,
    };
  }
}
