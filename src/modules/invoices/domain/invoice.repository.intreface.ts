// domain/invoice.repository.interface.ts

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
  update(id: string, invoice: Invoice): Promise<Invoice>;
  existsForPeriod(
    clientId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<boolean>;
  findAllDueForGeneration(): Promise<string[]>; // Returns clientIds
}
