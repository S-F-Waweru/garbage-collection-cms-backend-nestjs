import { BadRequestException } from '@nestjs/common';
import { BaseEntity } from '../../../../shared/domain/entities/base.entity';

export class RefreshToken extends BaseEntity {
  private readonly _tokenHash: string;
  private readonly _userId: string;
  private readonly _expiresAt: Date;
  private _isRevoked: boolean;
  private _revokedAt?: Date;

  private constructor(
    props: {
      id?: string;
      tokenHash: string;
      userId: string;
      expiresAt: Date;
      isRevoked?: boolean;
      revokedAt?: Date;
    },
    skipValidation = false,
  ) {
    super(props.id);
    this._tokenHash = props.tokenHash;
    this._userId = props.userId;
    this._expiresAt = props.expiresAt;
    this._isRevoked = props.isRevoked || false;
    this._revokedAt = props.revokedAt;

    if (!skipValidation) {
      this.validate();
    }
  }

  private validate(): void {
    if (!this._tokenHash) {
      throw new BadRequestException('Token hash is required');
    }
    if (!this._userId) {
      throw new BadRequestException('User ID is required');
    }
    if (!this._expiresAt) {
      throw new BadRequestException('Expiration date is required');
    }
    if (this._expiresAt <= new Date()) {
      throw new BadRequestException('Token must have a future expiration date');
    }
  }

  // Factory method for new tokens
  static create(
    tokenHash: string,
    userId: string,
    expiresAt: Date,
  ): RefreshToken {
    return new RefreshToken({
      tokenHash,
      userId,
      expiresAt,
    });
  }

  // Reconstitute from database
  static fromPersistence(props: {
    id: string;
    tokenHash: string;
    userId: string;
    expiresAt: Date;
    isRevoked: boolean;
    revokedAt?: Date;
  }): RefreshToken {
    return new RefreshToken(
      {
        id: props.id,
        tokenHash: props.tokenHash,
        userId: props.userId,
        expiresAt: props.expiresAt,
        isRevoked: props.isRevoked,
        revokedAt: props.revokedAt,
      },
      true, // Skip validation for persisted tokens
    );
  }

  // Business methods
  public revoke(): void {
    this._isRevoked = true;
    this._revokedAt = new Date();
    this.touch();
  }

  public isExpired(): boolean {
    return new Date() > this._expiresAt;
  }

  public isValid(): boolean {
    return !this._isRevoked && !this.isExpired();
  }

  // Getters
  get tokenHash(): string {
    return this._tokenHash;
  }

  get userId(): string {
    return this._userId;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get isRevoked(): boolean {
    return this._isRevoked;
  }

  get revokedAt(): Date | undefined {
    return this._revokedAt;
  }
}
