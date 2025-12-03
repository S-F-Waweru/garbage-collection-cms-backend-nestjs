import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUseCase } from './register-use-case.service';

describe('RegisterUseCaseTsService', () => {
  let service: RegisterUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegisterUseCase],
    }).compile();

    service = module.get<RegisterUseCase>(RegisterUseCase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
