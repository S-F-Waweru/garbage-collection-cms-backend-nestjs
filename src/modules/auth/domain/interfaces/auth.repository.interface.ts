import { Email } from '../value-objects/email.vo';
import { User } from '../entities/user.entity';

export interface IAuthRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  exists(email: Email): Promise<boolean>;
}
export const IAuthRepository = Symbol('IAuthRepository');
