// domain/payment.repository.interface.ts
import { Payment, PaymentMethod } from './payment.entity';

export interface PaymentFilters {
  clientId?: string;
  paymentMethod?: PaymentMethod;
  startDate?: Date;
  endDate?: Date;
}

export interface IPaymentRepository {
  getNextPaymentNumber(): Promise<string>;
  save(payment: Payment): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  findByPaymentNumber(paymentNumber: string): Promise<Payment | null>;
  findByClient(clientId: string): Promise<Payment[]>;
  findAll(filters?: PaymentFilters): Promise<Payment[]>;
  findAllPaginated(skip: number, limit: number): Promise<[Payment[], number]>;
  update(id: string, payment: Payment): Promise<Payment | null>;
}

export const IPaymentRepository = Symbol('IPaymentRepository');
