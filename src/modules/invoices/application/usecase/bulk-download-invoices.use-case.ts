// application/use-cases/bulk-download-invoices.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { IInvoiceRepository } from '../../domain/invoice.repository.intreface';
import { Invoice } from '../../domain/invoice.entity';
import PDFDocument from 'pdfkit';
import archiver from 'archiver';
import { PassThrough } from 'stream';

@Injectable()
export class BulkDownloadInvoicesUseCase {
  constructor(
    @Inject(IInvoiceRepository)
    private readonly invoiceRepo: IInvoiceRepository,
  ) {}

  async execute(ids: string[]): Promise<archiver.Archiver> {
    // 1. Create a ZIP archive with archiver
    const archive = archiver('zip', { zlib: { level: 5 } });

    // 2. Process each ID
    // We use an immediately invoked async function to handle the stream flow
    (async () => {
      try {
        for (const id of ids) {
          const invoice = await this.invoiceRepo.findById(id);
          if (!invoice) continue;

          // Create a PassThrough stream to bridge PDFKit and Archiver
          const pdfStream = new PassThrough();

          // Generate the PDF and pipe it to the PassThrough stream
          this.generatePdfContent(invoice, pdfStream);

          // Append the stream to the ZIP with a specific filename
          archive.append(pdfStream, {
            name: `Invoice_${invoice.invoiceNumber}.pdf`,
          });
        }

        // Finalize the archive once all invoices are added
        await archive.finalize();
      } catch (err) {
        archive.emit('error', err);
      }
    })();

    return archive;
  }

  /**
   * Refactored drawing logic to accept a WritableStream
   */
  private generatePdfContent(
    invoice: Invoice,
    stream: NodeJS.WritableStream,
  ): void {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Pipe the PDF output to our stream bridge
    doc.pipe(stream);

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
      .text(`Date: ${invoice.invoiceDate.toLocaleDateString()}`, 200, 65, {
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
        .text(`Balance Due: $${invoice.balance.toFixed(2)}`, 50, totalTop + 35);
    }

    // Crucial: Finalize the document
    doc.end();
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
