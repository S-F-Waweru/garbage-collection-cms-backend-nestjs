import { BaseEntity } from '../../../../shared/domain/entities/base.entity';
import { BadRequestException } from '@nestjs/common';
import { Role } from '../../policies/rbac.policy';
import { Email } from '../value-objects/email.vo';
import { Password } from '../value-objects/Password.vo';

// todo add value objects => Password, Email
export class User extends BaseEntity {
  _firstName: string;
  _lastName: string;
  _email: Email;
  _password: Password;
  _role: Role;

  constructor(props: {
    id?: string;
    firstName: string;
    lastName: string;
    email: Email;
    password: Password;
    role?: Role;
  }) {
    super(props.id);
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._email = props.email;
    this._password = props.password;
    this._role = props.role || Role.ACCOUNTANT;

    this.validate();
  }

  static create(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role?: Role,
  ): User {
    if (password === undefined || password === null) {
      throw new BadRequestException('Password cannot be undefined or null');
    }

    const emailVO = new Email(email);
    const passwordVO = new Password(password);

    return new User({
      email: emailVO,
      password: passwordVO,
      firstName,
      lastName,
      role,
    });
  }

  static fromPersistence(props: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    hashedPassword: string;
    role: Role;
  }) {
    return new User({
      id: props.id,
      firstName: props.firstName,
      lastName: props.lastName,
      email: new Email(props.email),
      password: new Password(props.hashedPassword),
      role: props.role,
    });
  }

  private validate(): void {
    if (!this._firstName || this._firstName.trim().length === 0) {
      throw new BadRequestException('First name is required');
    }
    if (!this._lastName || this._lastName.trim().length === 0) {
      throw new BadRequestException('Last name is required');
    }
  }

  changePassword(newPassword: string): void {
    this._password = new Password(newPassword);
  }

  setRole(role: Role) {
    this._role = role;
    this.touch();
  }

  // Getters
  get email(): Email {
    return this._email;
  }
  get password(): Password {
    return this._password;
  }
  get firstName(): string {
    return this._firstName;
  }
  get role(): Role {
    return this._role;
  }
  get lastName(): string {
    return this._lastName;
  }
  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }
}
