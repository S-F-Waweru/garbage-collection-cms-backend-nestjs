import { Test, TestingModule } from '@nestjs/testing';
import { ChangePasswordUseCase } from './change-password-use-case.service';

describe('ChangePasswordUseCaseService', () => {
  let service: ChangePasswordUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChangePasswordUseCase],
    }).compile();

    service = module.get<ChangePasswordUseCase>(ChangePasswordUseCase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
