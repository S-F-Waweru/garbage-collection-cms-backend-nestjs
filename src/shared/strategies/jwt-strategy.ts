// import { Injectable, NotFoundException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { ConfigService } from '@nestjs/config';
// import { Inject } from '@nestjs/common';
// import { IAuthRepository } from '../../modules/auth/domain/interfaces/auth.repository.interface';
//
// export interface JwtPayload {
//   userId: string;
//   merchantId: string;
//   email: string;
// }
//
// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(
//     private configService: ConfigService,
//     @Inject(IAuthRepository)
//     private userRepository: IAuthRepository,
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: configService.get('JWT_ACCESS_SECRET') || 'fallback-secret', // ✅ Add fallback
//     });
//   }
//
//   async validate(payload: JwtPayload) {
//     // Verify user still exists and is active
//     const user = await this.userRepository.findById(payload.userId);
//     if (!user) {
//       return new NotFoundException('User not found');
//     }
//
//     // This gets attached to request.user
//     return {
//       userId: payload.userId,
//       merchantId: payload.merchantId,
//       email: payload.email,
//     };
//   }
// }
