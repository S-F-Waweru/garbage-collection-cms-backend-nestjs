import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository, LessThan } from 'typeorm';
import { RefreshTokenSchema } from '../schema/refresh-token.schema';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository implements RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenSchema)
    private readonly repository: Repository<RefreshTokenSchema>,
  ) {}
  async findById(id: string): Promise<RefreshToken | null> {
    const schema = await this.repository.findOne({ where: { id } });
    return schema ? this.toDomain(schema) : null;
  }

  async findByToken(tokenHash: string): Promise<RefreshToken | null> {
    const schema = await this.repository.findOne({
      where: { tokenHash },
    });
    return schema ? this.toDomain(schema) : null;
  }
  async findByUserId(userId: string): Promise<RefreshToken | null> {
    const schema = await this.repository.findOne({ where: { userId } });
    return schema ? this.toDomain(schema) : null;
  }

  async save(token: RefreshToken): Promise<RefreshToken> {
    const schema = this.toSchema(token);
    const saved = await this.repository.save(schema);
    return this.toDomain(saved);
  }

  async update(token: RefreshToken): Promise<RefreshToken> {
    const schema = this.toSchema(token);
    await this.repository.update(token.id, schema);
    const updated = await this.repository.findOne({ where: { id: token.id } });
    return updated ? this.toDomain(updated) : token;
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
  private toDomain(schema: RefreshTokenSchema): RefreshToken {
    return RefreshToken.fromPersistence({
      id: schema.id,
      tokenHash: schema.tokenHash,
      userId: schema.userId,
      expiresAt: schema.expiresAt,
      isRevoked: schema.isRevoked,
      revokedAt: schema.revokedAt,
    });
  }

  // Mapper: Domain Entity → Database Schema
  private toSchema(token: RefreshToken): Partial<RefreshTokenSchema> {
    return {
      id: token.id,
      tokenHash: token.tokenHash,
      userId: token.userId,
      expiresAt: token.expiresAt,
      isRevoked: token.isRevoked,
      revokedAt: token.revokedAt,
    };
  }
}
