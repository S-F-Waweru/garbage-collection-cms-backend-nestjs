import { Test, TestingModule } from '@nestjs/testing';
import { PasswordHasherServiceService } from './password-hasher-service.service';

describe('PasswordHasherServiceService', () => {
  let service: PasswordHasherServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordHasherServiceService],
    }).compile();

    service = module.get<PasswordHasherServiceService>(PasswordHasherServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
