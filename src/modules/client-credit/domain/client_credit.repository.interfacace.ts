import { ClientCredit } from "./client-credit.entity";

export interface ICreditClientRepository {
    save(clientCredit: ClientCredit): Promise<ClientCredit>;
    
    findById(id: string): Promise<ClientCredit | null>;
    
    findByClientId(clientId: string): Promise<ClientCredit | null>;
    
    incrementBalance(clientId: string, amount: number): Promise<ClientCredit>;
    
    decrementBalance(clientId: string, amount: number): Promise<ClientCredit>;
    
    updateBalance(clientId: string, newBalance: number): Promise<ClientCredit>;
    
    exists(clientId: string): Promise<boolean>;
}

export const ICreditClientRepository = Symbol('ICreditClientRepository')