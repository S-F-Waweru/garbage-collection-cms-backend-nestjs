import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { RegisterUseCase } from '../../application/use-cases/register.use-case.ts/register-use-case.service';
import { LoginUseCase } from '../../application/use-cases/login.use-case.ts/login.use-case';
import {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
} from '../../application/dto/auth.request.dto';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case/change-password-use-case.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
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

  @Post('/changePassword')
  @HttpCode(HttpStatus.OK)
  changePassword(@Body() dto: ChangePasswordDto) {
    return this.changePasswordUseCase.execute(dto);
  }
}
