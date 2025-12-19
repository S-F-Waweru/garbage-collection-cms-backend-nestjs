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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

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

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  // ---------------------------
  // Register
  // ---------------------------
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }

  // ---------------------------
  // Login
  // ---------------------------
  @Post('login')
  @ApiOperation({
    summary: 'Login user and return access & refresh tokens',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  // ---------------------------
  // Change Password (Protected)
  // ---------------------------
  @UseGuards(JwtAuthGuard)
  @Post('changePassword')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Change password (authenticated user)',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  changePassword(@Body() dto: ChangePasswordDto) {
    return this.changePasswordUseCase.execute(dto);
  }

  // ---------------------------
  // Refresh Token (Public)
  // ---------------------------
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Provide the refresh token in the Authorization header as: Bearer <refresh-token>',
  })
  @ApiResponse({
    status: 200,
    description: 'New access and refresh tokens issued',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing refresh token',
  })
  async refresh(@Body() refresh: { refresh: string }) {
    const refreshToken = refresh.refresh;
    const result = await this.refreshTokenUseCase.execute(refreshToken);
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  // ---------------------------
  // Me (Protected)
  // ---------------------------
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user returned',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  me(@CurrentUser() user: any) {
    return {
      user,
      message: 'This is a protected route',
    };
  }
}
