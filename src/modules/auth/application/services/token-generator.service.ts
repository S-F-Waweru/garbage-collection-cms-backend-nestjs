import { randomBytes } from 'crypto';

export class TokenGeneratorService {
  generate(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }
}
