import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface AccessTokenPayload {
  userId: string;
  email: string;
  // roles?: string[];     // Add later when you have roles
  // permissions?: string[]; // Add later when you have permissions
}

export interface RefreshTokenPayload {
  userId: string;
}

@Injectable()
export class JwtService {
  constructor(
    private readonly nestJwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(payload: AccessTokenPayload) {
    return this.nestJwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION'), // '15m'
    });
  }

  generateRefreshToken(payload: RefreshTokenPayload) {
    return this.nestJwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRATION'), // '7d'
    });
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return this.nestJwtService.verify(token, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
    });
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    return this.nestJwtService.verify(token, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });
  }
}
