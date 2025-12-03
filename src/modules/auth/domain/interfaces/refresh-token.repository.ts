import { RefreshToken } from '../entities/refresh-token.entity';

export interface IRefreshTokenRepository {
  findById(id: string): Promise<RefreshToken | null>;
  findByToken(tokenHash: string): Promise<RefreshToken | null>;
  findByUserId(userId: string): Promise<RefreshToken[]>;
  save(token: RefreshToken): Promise<RefreshToken>;
  update(token: RefreshToken): Promise<RefreshToken>;
  delete(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  deleteExpiredTokens(): Promise<void>;
}
export const IRefreshTokenRepository = Symbol('IRefreshTokenRepository');
