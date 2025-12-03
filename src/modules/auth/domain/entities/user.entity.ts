import { BaseEntity } from '../../../../shared/domain/entities/base.entity';
import { Email } from '../value-objects/email.vo';
import { Password } from '../value-objects/Password.vo';
import { BadRequestException } from '@nestjs/common';

// todo add value objects => Password, Email
export class User extends BaseEntity {
  _firstName: string;
  _lastName: string;
  _email: Email;
  _password: Password;

  constructor(props: {
    id?: string;
    firstName: string;
    lastName: string;
    email: Email;
    password: Password;
  }) {
    super(props.id);
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._email = props.email;
    this._password = props.password;

    this.validate();
  }
  static create(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): User {
    // Check if password is undefined/null before creating Email VO
    if (password === undefined || password === null) {
      console.error('ERROR: Password is undefined or null!');
      throw new BadRequestException('Password cannot be undefined or null');
    }

    // Now create both for real
    const emailVO = new Email(email);
    const passwordVO = new Password(password);

    console.log('=== Creating User entity ===');
    const user = new User({
      email: emailVO,
      password: passwordVO,
      firstName,
      lastName,
    });

    console.log('=== User creation completed successfully ===');
    return user;
  }

  static fromPersistence(props: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    hashedPassword: string;
  }) {
    return new User({
      id: props.id,
      firstName: props.firstName,
      lastName: props.lastName,
      email: new Email(props.email),
      password: new Password(props.hashedPassword),
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
  get lastName(): string {
    return this._lastName;
  }
}
