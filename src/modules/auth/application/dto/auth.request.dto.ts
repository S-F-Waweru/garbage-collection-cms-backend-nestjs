import {
  IsEmail,
  IsEnum,
  IsString,
  Matches,
  MinLength,
  IsOptional,
} from 'class-validator';
import { Role } from '../../policies/rbac.policy';

export class LoginDto {
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(1)
  password: string;
}
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string; // Make optional

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
export class ChangePasswordDto {
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain uppercase, lowercase, number, and special character',
  })
  newPassword: string;
  @IsString()
  currentPassword: string;

  @IsString()
  userId: string;
}
export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}
export class ResetPasswordDto {
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain uppercase, lowercase, number, and special character',
  })
  newPassword: string;
  @IsString()
  token: string;
}
