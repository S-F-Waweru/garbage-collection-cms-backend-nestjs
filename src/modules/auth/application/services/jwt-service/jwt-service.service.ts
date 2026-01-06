import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from '../../../policies/rbac.policy';

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: Role;
  // permissions?: string[]; // Add later when you have permissions
}

export interface RefreshTokenPayload {
  userId: string;
}

@Injectable()
export class JwtService {
  jwtAccessSecret: string | undefined = '';
  jwtRefreshSecret: string | undefined = '';
  jwtExpiration: string | undefined = '';
  refreshTokenExpiration: string | undefined = '';

  constructor(
    private readonly nestJwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtAccessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    if (!this.jwtAccessSecret) {
      throw new InternalServerErrorException(
        'JWT_ACCESS_SECRET is not defined in configuration',
      );
    }

    this.jwtRefreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!this.jwtRefreshSecret) {
      throw new InternalServerErrorException(
        'JWT_REFRESH_SECRET is not defined in configuration',
      );
    }

    this.jwtExpiration = this.configService.get<string>('JWT_EXPIRATION');
    if (!this.jwtExpiration) {
      throw new InternalServerErrorException(
        'JWT_EXPIRATION is not defined in configuration',
      );
    }

    this.refreshTokenExpiration = this.configService.get<string>(
      'REFRESH_TOKEN_EXPIRATION',
    );
    if (!this.refreshTokenExpiration) {
      throw new InternalServerErrorException(
        'REFRESH_TOKEN_EXPIRATION is not defined in configuration',
      );
    }
  }

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
