// application/use-cases/bulk-download-invoices.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { IInvoiceRepository } from '../../domain/invoice.repository.intreface';
import { Invoice } from '../../domain/invoice.entity';
import PDFDocument from 'pdfkit';
import archiver from 'archiver';

@Injectable()
export class BulkDownloadInvoicesUseCase {
  constructor(
    @Inject(IInvoiceRepository)
    private readonly invoiceRepo: IInvoiceRepository,
  ) {}

  async execute(ids: string[]): Promise<archiver.Archiver> {
    const archive = archiver('zip', { zlib: { level: 5 } });

    for (const id of ids) {
      const invoice = await this.invoiceRepo.findById(id);
      if (!invoice) continue;

      const pdfBuffer = await this.generatePdfBuffer(invoice);

      archive.append(pdfBuffer, {
        name: `Invoice_${invoice.invoiceNumber}.pdf`,
      });
    }

    await archive.finalize();
    return archive;
  }

  /**
   * Generate PDF as a Buffer
   */
  private generatePdfBuffer(invoice: Invoice): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // --- YOUR DATA LOGIC ---
      // 1. Header
      doc
        .fillColor('#444444')
        .fontSize(20)
        .text('INVOICE', 50, 50)
        .fontSize(10)
        .text(`Invoice Number: ${invoice.invoiceNumber}`, 200, 50, {
          align: 'right',
        })
        .text(`Date: ${invoice.dueDate.toString()}`, 200, 65, {
          align: 'right',
        })
        .moveDown();

      // 2. Billing Info
      doc.moveTo(50, 100).lineTo(550, 100).stroke();

      doc.fontSize(12).text('Billing Period:', 50, 115);
      doc
        .fontSize(10)
        .text(
          `${invoice.billingPeriodStart.toLocaleDateString()} - ${invoice.billingPeriodEnd.toLocaleDateString()}`,
          50,
          130,
        );

      // 3. Table Header
      const tableTop = 170;
      doc.font('Helvetica-Bold');
      this.generateTableRow(
        doc,
        tableTop,
        'Description',
        'Units',
        'Unit Price',
        'Total',
      );
      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

      // 4. Table Row
      doc.font('Helvetica');
      this.generateTableRow(
        doc,
        tableTop + 25,
        'Service Subscription',
        invoice.activeUnits.toString(),
        `$${invoice.unitPrice.toFixed(2)}`,
        `$${invoice.subtotal.toFixed(2)}`,
      );

      // 5. Totals
      const totalTop = tableTop + 60;
      doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, 400, totalTop, {
        align: 'right',
      });
      doc.text(
        `Credit Applied: -$${invoice.creditApplied.toFixed(2)}`,
        400,
        totalTop + 15,
        { align: 'right' },
      );

      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(
          `Total Amount: $${invoice.totalAmount.toFixed(2)}`,
          400,
          totalTop + 35,
          { align: 'right' },
        );

      // 6. Status Watermark
      if (invoice.isPaid()) {
        doc.fillColor('green').text('PAID', 50, totalTop + 35);
      } else {
        doc
          .fillColor('red')
          .text(
            `Balance Due: $${invoice.balance.toFixed(2)}`,
            50,
            totalTop + 35,
          );
      }

      // Finalize the document
      doc.end();
    });
  }

  private generateTableRow(
    doc: any,
    y: number,
    desc: string,
    units: string,
    price: string,
    total: string,
  ) {
    doc
      .text(desc, 50, y)
      .text(units, 250, y, { width: 90, align: 'right' })
      .text(price, 350, y, { width: 90, align: 'right' })
      .text(total, 450, y, { align: 'right' });
  }
}
