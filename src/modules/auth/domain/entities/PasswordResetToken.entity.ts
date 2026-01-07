import { BadRequestException } from '@nestjs/common';
import { BaseEntity } from 'src/shared/domain/entities/base.entity';

export class PasswordResetToken extends BaseEntity {
  private readonly _token: string;
  private readonly _userId: string;
  private readonly _expiresAt: Date;
  private _isUsed: boolean;
  private _usedAt?: Date;

  // ✅ Change to private constructor
  private constructor(props: {
    id?: string;
    token: string;
    userId: string;
    expiresAt: Date;
    isUsed?: boolean;
    usedAt?: Date;
  }) {
    super(props.id);
    this._token = props.token;
    this._userId = props.userId;
    this._expiresAt = props.expiresAt;
    this._isUsed = props.isUsed || false;
    this._usedAt = props.usedAt;
    this.validate();
  }

  // ✅ Add factory method for new tokens
  static create(
    token: string,
    userId: string,
    expiresAt: Date,
  ): PasswordResetToken {
    return new PasswordResetToken({
      token,
      userId,
      expiresAt,
    });
  }

  // ✅ Add fromPersistence for database reconstitution
  static fromPersistence(props: {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date;
    isUsed: boolean;
    usedAt?: Date;
  }): PasswordResetToken {
    return new PasswordResetToken({
      id: props.id,
      token: props.token,
      userId: props.userId,
      expiresAt: props.expiresAt,
      isUsed: props.isUsed,
      usedAt: props.usedAt,
    });
  }

  private validate(): void {
    if (!this._token) throw new BadRequestException('Token cannot be empty');
    if (this._expiresAt <= new Date())
      throw new BadRequestException('Token cannot be expired');
  }

  // ✅ Add touch() call for domain events
  markAsUsed(): void {
    this._isUsed = true;
    this._usedAt = new Date();
    this.touch();
  }

  // ✅ Add business methods like other tokens
  public isExpired(): boolean {
    return new Date() > this._expiresAt;
  }

  public isValid(): boolean {
    return !this._isUsed && !this.isExpired();
  }

  get token(): string {
    return this._token;
  }
  get userId(): string {
    return this._userId;
  }
  get expiresAt(): Date {
    return this._expiresAt;
  }
  get isUsed(): boolean {
    return this._isUsed;
  }
  get usedAt(): Date | undefined {
    return this._usedAt;
  }
}
