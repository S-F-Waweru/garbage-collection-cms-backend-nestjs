import { Test, TestingModule } from '@nestjs/testing';
import { LoginUseCaseTs } from './login.use-case.ts';

describe('LoginUseCaseTs', () => {
  let provider: LoginUseCaseTs;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoginUseCaseTs],
    }).compile();

    provider = module.get<LoginUseCaseTs>(LoginUseCaseTs);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
