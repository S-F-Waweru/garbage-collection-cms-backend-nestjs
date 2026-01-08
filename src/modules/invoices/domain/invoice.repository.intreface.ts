import { InvoiceStatus } from '../application/models';
import {  Invoice } from './invoice.entity';

export interface InvoiceFilters {
  clientId?: string;
  status?: InvoiceStatus;
  fromDate?: Date;
  toDate?: Date;
}

export interface IInvoiceRepository {
  getNextInvoiceNumber(): Promise<string>;
  save(invoice: Invoice): Promise<Invoice>;
  findById(id: string): Promise<Invoice | null>;
  findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null>;
  findByClient(clientId: string): Promise<Invoice[]>;
  findOutstandingByClient(clientId: string): Promise<Invoice[]>;
  findAll(filters?: InvoiceFilters): Promise<Invoice[]>;
  findAllPaginated(skip: number, limit: number): Promise<[Invoice[], number]>;
  update(id: string, invoice: Invoice): Promise<Invoice | null>;
  existsForPeriod(
    clientId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<boolean>;
  findAllDueForGeneration(): Promise<string[]>; // Returns clientIds
}
export const IInvoiceRepository = Symbol('IInvoiceRepository');
