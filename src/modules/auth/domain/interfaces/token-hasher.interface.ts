export interface ITokenHasher {
  hash(token: string): string;
  verify(token: string, hash: string): boolean;
}

export const ITokenHasher = Symbol('ITokenHasher');
