import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UseRoles } from 'nest-access-control';

import { RegisterUseCase } from '../../application/use-cases/register.use-case.ts/register-use-case.service';
import { LoginUseCase } from '../../application/use-cases/login.use-case.ts/login.use-case';
import {
  ChangePasswordDto,
  ChangeRoleDTO,
  LoginDto,
  RegisterDto, UpdateUserDto,
} from '../../application/dto/auth.request.dto';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case/change-password-use-case.service';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { Public } from '../decorators/public.decorator';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import type { CurrentUserDto } from '../../../expences/petty-cash/presentation/petty-cash.controller';
import { ViewPaginatedUsersUsecase } from '../../application/use-cases/view-paginated-users.usecase';
import { UpdateRoleUsecase } from '../../application/use-cases/update-roles.usecase';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.usecase';
import { RequestPasswordResetUseCase } from '../../application/use-cases/request-password-reset.usecase';
import {UpdateUserUseCase} from "../../application/use-cases/update-user.use-case";


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
      private readonly registerUseCase: RegisterUseCase,
      private readonly loginUseCase: LoginUseCase,
      private readonly changePasswordUseCase: ChangePasswordUseCase,
      private readonly refreshTokenUseCase: RefreshTokenUseCase,
      private readonly getUsersUseCase: ViewPaginatedUsersUsecase,
      private readonly updateRole: UpdateRoleUsecase,
      private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
      private readonly resetPasswordUseCase: ResetPasswordUseCase,
      private readonly updateUserUseCase: UpdateUserUseCase,
  ) {}

  logger = new Logger(AuthController.name);

  // ---------------------------
  // Register
  // ---------------------------
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseRoles({
    resource: 'user',
    action: 'create',
    possession: 'any',
  })
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }

  // ---------------------------
  // Login
  // ---------------------------
  @Public()
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
  @Post('change-password')
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
  changePassword(
      @CurrentUser() user: CurrentUserDto,
      @Body() dto: ChangePasswordDto,
  ) {
    return this.changePasswordUseCase.execute(user.userId, dto);
  }

  // ---------------------------
  // Refresh Token (Public)
  // ---------------------------
  @Post('refresh')
  @Public()
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

  @Public()
  @Post('password/request-reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: 200,
    description: 'Reset email sent if account exists',
  })
  async requestPasswordReset(@Body() body: { email: string }) {
    this.logger.debug(`Email gotten`);
    return this.requestPasswordResetUseCase.execute({ email: body.email });
  }

  @Public()
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.resetPasswordUseCase.execute({
      token: body.token,
      newPassword: body.newPassword,
    });
  }

  // ---------------------------
  // Me (Protected)
  // ---------------------------
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

  @Get('users')
  @HttpCode(HttpStatus.OK)
  @UseRoles({
    resource: 'user',
    action: 'read',
    possession: 'any',
  })
  @ApiOperation({ summary: 'Get Users (paginated)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Users fetched successfully' })
  async getUsers(
      @Query('page') page: string = '1',
      @Query('limit') limit: string = '10',
  ) {
    return this.getUsersUseCase.execute({
      page: Number(page),
      limit: Number(limit),
    });
  }


  @Patch('users/:id')
  @UseRoles({
    resource: 'user',
    action: 'update',
    possession: 'any',
  })
  @ApiOperation({ summary: 'Update user details (firstName, lastName)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
      @CurrentUser() user: any,
      @Param('id') id: string,
      @Body() dto: UpdateUserDto) {

    const loggedUserId = user.userId;
    return this.updateUserUseCase.execute(loggedUserId, dto);
  }

  @Patch('users/:id/role')
  @UseRoles({
    resource: 'user',
    action: 'update',
    possession: 'any',
  })
  @ApiOperation({ summary: 'Update user role' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiBody({ type: ChangeRoleDTO })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  async changeRole(
      @CurrentUser() user: any,
      @Param('id') targetUserId: string,
      @Body() dto: ChangeRoleDTO,
  ) {
    const loggedUserId = user.userId;
    dto.userId = targetUserId;
    return await this.updateRole.execute(loggedUserId, dto);
  }
}