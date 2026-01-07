import { PasswordResetToken } from '../entities/PasswordResetToken.entity';

export interface IPasswordResetTokenRepository {
  findById(id: string): Promise<PasswordResetToken | null>;
  findByToken(token: string): Promise<PasswordResetToken | null>;
  findByUserId(userId: string): Promise<PasswordResetToken[]>;
  save(token: PasswordResetToken): Promise<PasswordResetToken>;
  update(token: PasswordResetToken): Promise<PasswordResetToken>;
  delete(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  deleteExpiredTokens(): Promise<void>;
}

export const IPasswordResetTokenRepository = Symbol(
  'IPasswordResetTokenRepository',
);
