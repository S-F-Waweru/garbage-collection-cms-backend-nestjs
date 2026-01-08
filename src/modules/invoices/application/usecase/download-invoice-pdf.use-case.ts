import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { IInvoiceRepository } from '../../domain/invoice.repository.intreface';
import { IClientRepository } from 'src/modules/clients/client/domain/interface/client.repository.interface';
import PDFDocument from 'pdfkit';

@Injectable()
export class DownloadInvoicePdfUseCase {
  constructor(
    @Inject(IInvoiceRepository)
    private readonly invoiceRepo: IInvoiceRepository,
    @Inject(IClientRepository)
    private readonly clientRepo: IClientRepository,
  ) {}

  private readonly logger = new Logger(DownloadInvoicePdfUseCase.name);

  async execute(id: string): Promise<Buffer> {
    const invoice = await this.invoiceRepo.findById(id);
    if (!invoice) throw new NotFoundException('Invoice not found');

    const client = await this.clientRepo.findById(invoice.clientId);

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ size: 'A4', margin: 50 });

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      this.generateHeader(doc, invoice);
      this.generateCustomerInformation(doc, invoice, client);
      this.generateInvoiceTable(doc, invoice);
      this.generateFooter(doc, invoice);

      // --- Optional: Paid Watermark ---
      if (invoice.isPaid()) {
        this.addStatusWatermark(doc, 'PAID');
      }

      doc.end();
    });
  }

  private generateHeader(doc: PDFKit.PDFDocument, invoice: any) {
    doc
      .fillColor('#444444')
      .fontSize(20)
      .text('TAX INVOICE', 50, 50) // Common terminology in Kenya
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(invoice.invoiceNumber, 200, 50, { align: 'right' })
      .font('Helvetica')
      .text(
        `Date: ${new Date(invoice.invoiceDate).toLocaleDateString('en-GB')}`,
        200,
        65,
        { align: 'right' },
      )
      .text(
        `Due Date: ${new Date(invoice.dueDate).toLocaleDateString('en-GB')}`,
        200,
        80,
        { align: 'right' },
      );

    this.generateHr(doc, 95);
  }

  private generateCustomerInformation(
    doc: PDFKit.PDFDocument,
    invoice: any,
    client: any,
  ) {
    const top = 115;

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('BILL TO:', 50, top)
      .font('Helvetica')
      .text(`${client?.firstName} ${client?.lastName}`, 50, top + 15)
      .font('Helvetica-Bold')
      .text(client?.companyName || 'Individual Client', 50, top + 30)
      .font('Helvetica')
      .text(`Email: ${client?.email}`, 50, top + 45)
      .text(`Phone: ${client?.phone}`, 50, top + 60)
      .text(`KRA PIN: ${client?.KRAPin || 'N/A'}`, 50, top + 75);

    doc
      .font('Helvetica-Bold')
      .text('Billing Period:', 350, top)
      .font('Helvetica')
      .text(
        `${new Date(invoice.billingPeriodStart).toLocaleDateString('en-GB')} - ${new Date(invoice.billingPeriodEnd).toLocaleDateString('en-GB')}`,
        350,
        top + 15,
      )
      .font('Helvetica-Bold')
      .text('Payment Mode:', 350, top + 40)
      .font('Helvetica')
      .text(client?.paymentMethod || 'BANK', 350, top + 55);

    this.generateHr(doc, 210);
  }

  private generateInvoiceTable(doc: PDFKit.PDFDocument, invoice: any) {
    const tableTop = 230;

    doc.font('Helvetica-Bold');
    this.generateTableRow(
      doc,
      tableTop,
      'Description',
      'Units',
      'Unit Price',
      'Total Amount',
    );
    this.generateHr(doc, tableTop + 18);

    doc.font('Helvetica');
    this.generateTableRow(
      doc,
      tableTop + 25,
      'Service Subscription',
      invoice.activeUnits.toString(),
      this.formatKsh(invoice.unitPrice),
      this.formatKsh(invoice.subtotal),
    );

    const lineEnd = tableTop + 45;
    this.generateHr(doc, lineEnd);

    // Totals Section
    const footerTop = lineEnd + 20;
    this.generateTotalRow(
      doc,
      footerTop,
      'Subtotal:',
      this.formatKsh(invoice.subtotal),
    );
    this.generateTotalRow(
      doc,
      footerTop + 20,
      'Credit Applied:',
      `- ${this.formatKsh(invoice.creditApplied)}`,
    );

    doc.font('Helvetica-Bold').fontSize(12);
    this.generateTotalRow(
      doc,
      footerTop + 45,
      'Total Amount:',
      this.formatKsh(invoice.totalAmount),
    );

    doc.fontSize(10).fillColor('#008000');
    this.generateTotalRow(
      doc,
      footerTop + 65,
      'Amount Paid:',
      this.formatKsh(invoice.amountPaid),
    );

    const balanceDue = Number(invoice.balance);
    doc.fillColor(balanceDue > 0 ? '#cc0000' : '#444444');
    this.generateTotalRow(
      doc,
      footerTop + 85,
      'Balance Due:',
      this.formatKsh(invoice.balance),
    );
    doc.fillColor('#444444');
  }

  private generateFooter(doc: PDFKit.PDFDocument, invoice: any) {
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Notes:', 50, 650)
      .font('Helvetica')
      .text(invoice.notes || 'No additional notes.', 50, 665, { width: 500 });

    doc
      .fontSize(8)
      .fillColor('#777777')
      .text(
        'This is a computer-generated document. No signature is required.',
        50,
        780,
        { align: 'center', width: 500 },
      );
  }

  private addStatusWatermark(doc: any, status: string) {
    doc
      .save()
      .opacity(0.1)
      .fontSize(100)
      .fillColor('#008000')
      .rotate(-45, { origin: [300, 400] })
      .text(status, 150, 400)
      .restore();
  }

  // --- Helpers ---

  private generateTableRow(
    doc: any,
    y: number,
    desc: string,
    qty: string,
    price: string,
    total: string,
  ) {
    doc
      .text(desc, 50, y)
      .text(qty, 280, y, { width: 50, align: 'right' })
      .text(price, 340, y, { width: 100, align: 'right' })
      .text(total, 450, y, { align: 'right' });
  }

  private generateTotalRow(doc: any, y: number, label: string, value: string) {
    doc.text(label, 340, y).text(value, 450, y, { align: 'right' });
  }

  private generateHr(doc: any, y: number) {
    doc
      .strokeColor('#aaaaaa')
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
  }

  private formatKsh(amount: any): string {
    const val = Number(amount);
    return `Ksh ${val.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
