import { Test, TestingModule } from '@nestjs/testing';
import { ResetPasswordUseCase } from './reset-password.use-case';

describe('ResetPasswordUseCase', () => {
  let provider: ResetPasswordUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResetPasswordUseCase],
    }).compile();

    provider = module.get<ResetPasswordUseCase>(ResetPasswordUseCase);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
