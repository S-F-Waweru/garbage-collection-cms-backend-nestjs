import { Client } from '../entities/client.entity';

export interface IClientRepository {
  findById(id: string): Promise<Client | null>;
  findByKRAPin(id: string): Promise<Client | null>;
  findAll(): Promise<Client[]>;
  save(clientCreditClient: Client): Promise<Client>;
  delete(id: string): Promise<{ message: string }>;
  findAllPaginated(skip: number, limit: number): Promise<[Client[], number]>;
}

export const IClientRepository = Symbol('IClientRepository');
