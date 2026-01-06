import { Email } from '../value-objects/email.vo';
import { User } from '../entities/user.entity';
import { PaginatedResult } from 'src/modules/clients/client/application/use-cases/find-all-pagiantion.use-case';

export interface IAuthRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  exists(email: Email): Promise<boolean>;
  getPaginatedUsers(page: number, limit: number): Promise<[User[], number]>;
}
export const IAuthRepository = Symbol('IAuthRepository');
