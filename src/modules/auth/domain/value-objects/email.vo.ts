import { BadRequestException } from '@nestjs/common';

// todo: add the correct exceptions
export class Email {
  private _value: string;

  constructor(value: string) {
    this._value = value.toLowerCase().trim();
    this.validate();
  }

  get value(): string {
    return this._value;
  }

  private validate(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this._value)) {
      throw new BadRequestException('Please enter a valid email address');
    }
  }
}
