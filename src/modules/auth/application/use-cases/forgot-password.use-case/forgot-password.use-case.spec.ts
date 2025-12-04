import { Test, TestingModule } from '@nestjs/testing';
import { ForgotPasswordUseCase } from './forgot-password.use-case';

describe('ForgotPasswordUseCase', () => {
  let provider: ForgotPasswordUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ForgotPasswordUseCase],
    }).compile();

    provider = module.get<ForgotPasswordUseCase>(ForgotPasswordUseCase);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
