import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { IAuthRepository } from '../../../domain/interfaces/auth.repository.interface';
import { PasswordHasherService } from '../../services/password-hasher-service/password-hasher-service.service';
import { RegisterDto } from '../../dto/auth.request.dto';
import { Email } from '../../../domain/value-objects/email.vo';
import { User } from '../../../domain/entities/user.entity';
import { Password } from '../../../domain/value-objects/Password.vo';
import { Role } from '../../../policies/rbac.policy';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(IAuthRepository)
    private readonly authRepository: IAuthRepository,
    private readonly passwordHasher: PasswordHasherService,
  ) {}
  logger = new Logger(RegisterUseCase.name);

  async execute(dto: RegisterDto) {
    const { email, password, firstName, lastName, role } = dto;
    const emailVO = new Email(email);
    const exists = await this.authRepository.findByEmail(emailVO);
    if (exists) throw new BadRequestException('User already exists');

    const userPassword =
      password ||
      password ||
      process.env.DEFAULT_USER_PASSWORD ||
      'ChangeMe@123';
    const user = User.create(email, userPassword, firstName, lastName, role);

    this.logger.debug(user);
    this.logger.debug(userPassword);

    //    hash the Password
    const hashedPassword = await this.passwordHasher.hash(userPassword);
    const securePassword = new Password(hashedPassword, true);
    const hashedUser = User.fromPersistence({
      email: user.email.value,
      firstName: user.firstName,
      hashedPassword: securePassword.value,
      id: user.id,
      lastName: user.lastName,
      role: user.role || Role.ACCOUNTANT,
    });

    // update User
    const savedUser = await this.authRepository.save(hashedUser);

    console.log('Saved User:', savedUser);

    return {
      id: savedUser.id,
      email: savedUser.email.value,
      role: savedUser.role,
      defaultPassword: !password ? userPassword : undefined, // Return default password if used
      message: 'User registered successfully',
    };
  }
}
