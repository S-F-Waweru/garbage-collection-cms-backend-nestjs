import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { IAuthRepository } from '../../domain/interfaces/auth.repository.interface';

export interface JwtPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @Inject(IAuthRepository)
    private userRepository: IAuthRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_SECRET') || 'fallback-secret', // ✅ Add fallback
    });
  }

  async validate(payload: JwtPayload) {
    // Verify user still exists and is active
    const user = await this.userRepository.findById(payload.userId);

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // This gets attached to request.user
    return {
      userId: payload.userId,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: payload.role,
    };
  }
}
