import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { IAuthRepository } from '../../../domain/interfaces/auth.repository.interface';
import { UserSchema } from '../schema/user.schema';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(
    @InjectRepository(UserSchema)
    private readonly repository: Repository<UserSchema>,
  ) {}

  // todo add all users finders needed
  async findById(id: string): Promise<User | null> {
    const schema = await this.repository.findOne({ where: { id } });
    return schema ? this.toDomain(schema) : null;
  }
  async findByEmail(email: Email): Promise<User | null> {
    const schema = await this.repository.findOne({
      where: { email: email.value, deletedAt: IsNull() },
    });
    return schema ? this.toDomain(schema) : null;
  }
  async save(user: User): Promise<User> {
    const schema = this.toSchema(user);
    const savedSchema = await this.repository.save(schema);
    return this.toDomain(savedSchema);
  }

  async update(user: User): Promise<User> {
    const schema = this.toSchema(user);
    const savedSchema = await this.repository.save(schema);
    return this.toDomain(savedSchema);
  }

  async delete(id: string): Promise<void> {
    await this.repository.update(id, {
      deletedAt: new Date(),
    });
  }
  async getPaginatedUsers(
    skip: number,
    limit: number,
  ): Promise<[User[], number]> {
    const [schemas, total] = await this.repository.findAndCount({
      where: { deletedAt: IsNull() },
      skip,
      take: limit,
    });
    return [schemas.map((s) => this.toDomain(s)), total];
  }

  async exists(email: Email): Promise<boolean> {
    const count = await this.repository.count({
      where: { email: email.value, deletedAt: IsNull() },
    });
    return count > 0;
  }
  // Mapper: Database Schema → Domain Entity
  private toDomain(schema: UserSchema): User {
    return User.fromPersistence({
      id: schema.id,
      email: schema.email,
      hashedPassword: schema.passwordHash,
      firstName: schema.firstName,
      lastName: schema.lastName,
      role: schema.role,
    });
  }
  private toSchema(user: User): Partial<UserSchema> {
    return {
      id: user.id,
      email: user.email.value,
      passwordHash: user.password?.value,
      // phoneNumber: user.phoneNumber?.value,
      firstName: user.firstName,
      lastName: user.lastName,
      updatedAt: new Date(),
      role: user.role,
    };
  }
}

export default AuthRepository;
