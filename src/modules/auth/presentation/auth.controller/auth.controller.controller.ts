import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { RegisterUseCase } from '../../application/use-cases/register.use-case.ts/register-use-case.service';
import { LoginUseCase } from '../../application/use-cases/login.use-case.ts/login.use-case';
import {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
} from '../../application/dto/auth.request.dto';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case/change-password-use-case.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { Public } from '../decorators/public.decorator';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  // todo restrict to only the admins can create users
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }

  @Post('/login')
  login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/changePassword')
  @HttpCode(HttpStatus.OK)
  changePassword(@Body() dto: ChangePasswordDto) {
    return this.changePasswordUseCase.execute(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }

    // Expected: "Bearer <refresh-token>"
    const [scheme, refreshToken] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !refreshToken) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    const result = await this.refreshTokenUseCase.execute(refreshToken);

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  @HttpCode(HttpStatus.OK)
  me(@CurrentUser() user: any) {
    return {
      user: user,
      message: 'This is a protected route',
    };
  }
}
