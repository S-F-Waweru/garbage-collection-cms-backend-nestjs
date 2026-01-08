import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { IInvoiceRepository } from '../../domain/invoice.repository.intreface';
import { IClientRepository } from 'src/modules/clients/client/domain/interface/client.repository.interface';
import PDFDocument from 'pdfkit';
import { Invoice } from '../../domain/invoice.entity';

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

      // Extract building name from client data if available
      const buildingName =
        client?.buildings && client.buildings.length > 0
          ? client.buildings[0].name
          : null;

      // --- PDF SECTIONS ---
      this.generateHeader(doc, invoice);
      this.generateCustomerInformation(doc, invoice, client);
      this.generateInvoiceTable(doc, invoice, buildingName);
      this.generateFooter(doc, invoice);

      // Add "PAID" Watermark for fully settled invoices
      if (invoice.isPaid()) {
        this.addStatusWatermark(doc, 'PAID');
      }

      doc.end();
    });
  }

  private generateHeader(doc: PDFKit.PDFDocument, invoice: Invoice) {
    // Brand Identity
    doc
      .fillColor('#2e7d32') // Brand Green
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('SustainableSweeps', 50, 50)
      .fillColor('#666666')
      .fontSize(10)
      .font('Helvetica-Oblique')
      .text('Transforming Mess into Freshness', 50, 75)
      .moveDown();

    // Invoice Meta-data
    doc
      .fillColor('#444444')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('TAX INVOICE', 200, 50, { align: 'right' })
      .fontSize(10)
      .font('Helvetica')
      .text(`Invoice No: ${invoice.invoiceNumber}`, 200, 72, { align: 'right' })
      .text(
        `Date: ${new Date(invoice.invoiceDate).toLocaleDateString('en-GB')}`,
        200,
        85,
        { align: 'right' },
      )
      .text(
        `Due Date: ${new Date(invoice.dueDate).toLocaleDateString('en-GB')}`,
        200,
        98,
        { align: 'right' },
      );

    this.generateHr(doc, 120);
  }

  private generateCustomerInformation(
    doc: PDFKit.PDFDocument,
    invoice: Invoice,
    client: any,
  ) {
    const top = 140;

    // Bill To Section
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('BILL TO:', 50, top)
      .font('Helvetica')
      .text(
        `${client?.firstName || ''} ${client?.lastName || ''}`,
        50,
        top + 15,
      )
      .font('Helvetica-Bold')
      .text(client?.companyName || 'Valued Client', 50, top + 30)
      .font('Helvetica')
      .text(`Email: ${client?.email || 'N/A'}`, 50, top + 45)
      .text(`Phone: ${client?.phone || 'N/A'}`, 50, top + 60)
      .text(`KRA PIN: ${client?.KRAPin || 'N/A'}`, 50, top + 75);

    // Context & Payment Info
    doc
      .font('Helvetica-Bold')
      .text('Service Period:', 350, top)
      .font('Helvetica')
      .text(
        `${new Date(invoice.billingPeriodStart).toLocaleDateString('en-GB')} - ${new Date(invoice.billingPeriodEnd).toLocaleDateString('en-GB')}`,
        350,
        top + 15,
      )
      .font('Helvetica-Bold')
      .text('Payment Mode:', 350, top + 45)
      .font('Helvetica')
      .text(client?.paymentMethod || 'BANK/MPESA', 350, top + 60);

    this.generateHr(doc, 235);
  }

  private generateInvoiceTable(
    doc: PDFKit.PDFDocument,
    invoice: Invoice,
    buildingName: string | null,
  ) {
    const tableTop = 255;

    const description = buildingName
      ? `Subscription Services: ${buildingName}`
      : 'Cleaning & Maintenance Subscription';

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
      description,
      invoice.activeUnits.toString(),
      this.formatKsh(invoice.unitPrice),
      this.formatKsh(invoice.subtotal),
    );

    const lineEnd = tableTop + 45;
    this.generateHr(doc, lineEnd);

    // Financial Summary
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

    doc.font('Helvetica-Bold').fontSize(11);
    this.generateTotalRow(
      doc,
      footerTop + 45,
      'Total Amount:',
      this.formatKsh(invoice.totalAmount),
    );

    doc.fontSize(10).fillColor('#2e7d32');
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

    doc.fillColor('#444444').font('Helvetica');
  }

  private generateFooter(doc: PDFKit.PDFDocument, invoice: Invoice) {
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Notes:', 50, 680)
      .font('Helvetica')
      .text(
        invoice.notes ||
          'Thank you for your business. Please settle the balance by the due date.',
        50,
        695,
        { width: 500 },
      );

    doc
      .fontSize(8)
      .fillColor('#777777')
      .text('SustainableSweeps • Transforming Mess into Freshness', 50, 770, {
        align: 'center',
        width: 500,
      })
      .text('Computer-generated invoice. No signature required.', 50, 782, {
        align: 'center',
        width: 500,
      });
  }

  private addStatusWatermark(doc: any, status: string) {
    doc
      .save()
      .opacity(0.1)
      .fontSize(100)
      .fillColor('#2e7d32')
      .rotate(-45, { origin: [300, 400] })
      .text(status, 150, 400)
      .restore();
  }

  // --- HELPER METHODS ---

  private generateTableRow(
    doc: any,
    y: number,
    desc: string,
    qty: string,
    price: string,
    total: string,
  ) {
    doc
      .text(desc, 50, y, { width: 220 })
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
      .lineWidth(0.5)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
  }

  private formatKsh(amount: any): string {
    const val = Number(amount);
    return `Ksh ${val.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  }
}
