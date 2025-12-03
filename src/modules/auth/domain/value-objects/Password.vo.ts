import { BadRequestException } from '@nestjs/common';

export class Password {
  private readonly _value: string;

  constructor(password: string, isHashed: boolean = false) {
    // Assign the password to _value
    this._value = password;
    if (!isHashed) {
      this.validate();
    }
  }

  private validate(): void {
    if (!this._value) {
      throw new BadRequestException('Password cannot be empty');
    }

    if (this._value.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    const hasUpperCase = /[A-Z]/.test(this._value);
    const hasLowerCase = /[a-z]/.test(this._value);
    const hasNumber = /\d/.test(this._value);
    const hasSpecialChar = /[@$!%*?&]/.test(this._value);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      throw new BadRequestException(
        'Password must contain uppercase, lowercase, number, and special character',
      );
    }

    console.log('=== Password validation passed ===');
  }

  get value(): string {
    return this._value;
  }
}
