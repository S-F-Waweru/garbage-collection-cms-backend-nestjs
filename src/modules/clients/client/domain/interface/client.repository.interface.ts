import { Client } from '../entities/client.entity';

export interface IClientRepository {
  findById(id: string): Promise<Client | null>;
  findAll(): Promise<Client[]>;
  save(client: Client): Promise<Client>;
  delete(id: string): Promise<{ message: string }>;
}

export const IClientRepository = Symbol('IClientRepository');
