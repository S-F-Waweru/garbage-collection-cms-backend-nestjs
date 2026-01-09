import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';

import * as crypto from 'crypto';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.repository';
import {
  JwtService,
  RefreshTokenPayload,
} from '../services/jwt-service/jwt-service.service';
import { IAuthRepository } from '../../domain/interfaces/auth.repository.interface';
import { ITokenHasher } from '../../domain/interfaces/token-hasher.interface';

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface RefreshTokenOutput {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(IRefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject(IAuthRepository)
    private readonly userRepository: IAuthRepository,
    @Inject(ITokenHasher)
    private readonly tokenHasher: ITokenHasher,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    refreshTokenString: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // 1. Verify JWT signature
    let payload: RefreshTokenPayload;
    try {
      payload = this.jwtService.verifyRefreshToken(refreshTokenString);
    } catch (error: any) {
      console.log(error);
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 2. Hash the token to find it in DB
    const incomingHash = this.tokenHasher.hash(refreshTokenString);

    // 3. Find token in database
    const storedToken =
      await this.refreshTokenRepository.findByToken(incomingHash);
    if (!storedToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // 4. Validate using entity business logic
    if (!storedToken.isValid()) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    // 5. Verify user still exists and is active
    const user = await this.userRepository.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // 6. Revoke old token (Token Rotation Pattern)
    storedToken.revoke();
    await this.refreshTokenRepository.save(storedToken);

    // 7. Generate new tokens
    const newAccessToken = this.jwtService.generateAccessToken({
      userId: user.id,
      email: user.email.value,
      role: user.role,
    });

    const newRefreshTokenString = this.jwtService.generateRefreshToken({
      userId: user.id,
    });

    const tokenHash = this.tokenHasher.hash(newRefreshTokenString);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const newRefreshToken = RefreshToken.create(tokenHash, user.id, expiresAt);

    await this.refreshTokenRepository.save(newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenString,
    };
  }
}
