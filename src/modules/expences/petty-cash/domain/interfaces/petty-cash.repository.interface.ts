import { PettyCash } from '../petty-cash.entity';

export interface IPettyCashRepository {
  save(pettyCash: PettyCash): Promise<PettyCash>;
  findById(id: string): Promise<PettyCash | null>;
  findAll(): Promise<PettyCash[]>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}

export const IPettyCashRepository = Symbol('IPettyCashRepository');
