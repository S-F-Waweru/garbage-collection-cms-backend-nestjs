import { Inject, Injectable } from '@nestjs/common';
import { IAuthRepository } from '../../../domain/interfaces/auth.repository.interface';
import { PasswordHasherService } from '../../services/password-hasher-service/password-hasher-service.service';
import { IRefreshTokenRepository } from '../../../domain/interfaces/refresh-token.repository';
import { LoginDto } from '../../dto/auth.request.dto';
import { Email } from '../../../domain/value-objects/email.vo';
import { JwtService } from '../../services/jwt-service/jwt-service.service';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(IAuthRepository)
    private readonly authRepositor: IAuthRepository,
    @Inject(IRefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly passwordHasher: PasswordHasherService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginDto) {
    const email = new Email(dto.email);
    const user = await this.authRepositor.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    if (!user.password) {
      throw new Error('Password not found or invalid');
    }

    const isPasswordValid = await this.passwordHasher.compare(
      dto.password,
      user.password.value,
    );
    if (!isPasswordValid) {
      throw new Error(' invalid credentials');
    }

    // 5. Generate new access token (JWT) with user data
    const accessToken = this.jwtService.generateAccessToken({
      userId: user.id,
      email: user.email.value,
    });

    // 6. Generate new refresh token (JWT) for session extension
    const refreshToken = this.jwtService.generateRefreshToken({
      userId: user.id,
    });

    // ✅ NEW: Create RefreshToken entity first
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const refreshTokenEntity = RefreshToken.create(
      refreshToken, // The token string
      user.id, // User ID
      expiresAt, // Expiration date
    );
    await this.refreshTokenRepository.save(refreshTokenEntity);

    // 8. Return tokens and user information (excluding sensitive data)
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}
