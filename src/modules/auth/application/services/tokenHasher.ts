import { Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { ITokenHasher } from '../../domain/interfaces/token-hasher.interface';

@Injectable()
export class TokenHasherService implements ITokenHasher {
  /**
   * Hashes a string using SHA-256.
   * Best for high-entropy strings like JWTs or API Keys.
   */
  hash(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Verifies if a raw token matches a stored hash.
   */
  verify(token: string, hash: string): boolean {
    const incomingHash = this.hash(token);
    return crypto.timingSafeEqual(Buffer.from(incomingHash), Buffer.from(hash));
  }
}
