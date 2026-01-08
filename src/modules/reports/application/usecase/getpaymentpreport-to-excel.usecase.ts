import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class PaymentExcelReport {
  constructor() {}

  async generate(data: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payments');

    // Configure workbook metadata
    workbook.creator = 'Sustainable Sweeps system';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Define columns
    worksheet.columns = [
      { header: 'Payment Number', key: 'paymentNumber', width: 20 },
      { header: 'Client Name', key: 'clientName', width: 30 },
      { header: 'Payment Date', key: 'paymentDate', width: 15 },
      { header: 'Amount (KES)', key: 'amount', width: 18 },
      { header: 'Payment Method', key: 'paymentMethod', width: 18 },
      { header: 'Reference Number', key: 'referenceNumber', width: 20 },
      { header: 'Applied to Invoices', key: 'appliedInvoices', width: 25 },
      { header: 'Excess Amount (KES)', key: 'excessAmount', width: 20 },
    ];

    // Add rows
    data.forEach((item) => {
      worksheet.addRow({
        paymentNumber: item.paymentNumber,
        clientName: `${item.clientFirstName} ${item.clientLastName}`,
        paymentDate: this.formatDate(item.paymentDate),
        amount: this.formatCurrency(item.amount),
        paymentMethod: item.paymentMethod,
        referenceNumber: item.referenceNumber || '',
        appliedInvoices: this.formatAppliedInvoices(item.appliedToInvoices),
        excessAmount: this.formatCurrency(item.excessAmount),
      });
    });
    // Add total row
    const totalAmount = data.reduce((sum, item) => {
      return sum + Math.round(parseFloat(item.amount || 0) * 100);
    }, 0);

    const totalExcess = data.reduce((sum, item) => {
      return sum + Math.round(parseFloat(item.excessAmount || 0) * 100);
    }, 0);

    const totalRow = worksheet.addRow({
      paymentNumber: 'TOTAL',
      clientName: '',
      paymentDate: '',
      amount: this.formatCurrency(totalAmount / 100),
      paymentMethod: '',
      referenceNumber: '',
      appliedInvoices: '',
      excessAmount: this.formatCurrency(totalExcess / 100),
    });

    // Style total row
    totalRow.font = { bold: true };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Style header and apply formatting
    this.styleHeader(worksheet);
    this.applyBorders(worksheet);

    // Generate and return buffer
    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }

  private formatAppliedInvoices(invoices: any[]): string {
    if (!invoices || invoices.length === 0) return 'None';
    return invoices.map((inv) => inv.invoiceNumber).join(', ');
  }

  private styleHeader(worksheet: ExcelJS.Worksheet) {
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 20;
  }

  private applyBorders(worksheet: ExcelJS.Worksheet) {
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });
  }

  private formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  }

  private formatCurrency(amount: number | string): string {
    if (amount === null || amount === undefined) return '0.00';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}
