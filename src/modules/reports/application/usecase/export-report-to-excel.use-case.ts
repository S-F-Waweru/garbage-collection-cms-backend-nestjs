// application/use-cases/export-report-to-excel.use-case.ts
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { ReportType } from '../../domain/report-result.entity';

@Injectable()
export class ExportReportToExcelUseCase {
  async execute(reportType: ReportType, data: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(this.getSheetName(reportType));

    // Configure workbook metadata
    workbook.creator = 'Garbage Collection Management System';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Add headers and data based on report type
    switch (reportType) {
      case ReportType.OUTSTANDING_BALANCES:
        this.addOutstandingBalancesSheet(worksheet, data);
        break;
      case ReportType.REVENUE_BY_CLIENT:
        this.addRevenueByClientSheet(worksheet, data);
        break;
      case ReportType.REVENUE_BY_LOCATION:
        this.addRevenueByLocationSheet(worksheet, data);
        break;
      case ReportType.PETTY_CASH:
        this.addPettyCashSheet(worksheet, data);
        break;
      case ReportType.OTHER_INCOME:
        this.addOtherIncomeSheet(worksheet, data);
        break;
      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }

    // Generate and return buffer
    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }

  private getSheetName(reportType: ReportType): string {
    const names = {
      [ReportType.OUTSTANDING_BALANCES]: 'Outstanding Balances',
      [ReportType.REVENUE_BY_CLIENT]: 'Revenue by Client',
      [ReportType.REVENUE_BY_LOCATION]: 'Revenue by Location',
      [ReportType.PETTY_CASH]: 'Petty Cash',
      [ReportType.OTHER_INCOME]: 'Other Income',
    };
    return names[reportType] || 'Report';
  }

  private addOutstandingBalancesSheet(
    worksheet: ExcelJS.Worksheet,
    data: any[],
  ) {
    // Define columns
    worksheet.columns = [
      { header: 'Client Name', key: 'clientName', width: 30 },
      { header: 'Invoice Number', key: 'invoiceNumber', width: 18 },
      { header: 'Invoice Date', key: 'invoiceDate', width: 15 },
      { header: 'Due Date', key: 'dueDate', width: 15 },
      { header: 'Total Amount (KES)', key: 'totalAmount', width: 18 },
      { header: 'Amount Paid (KES)', key: 'amountPaid', width: 18 },
      { header: 'Balance (KES)', key: 'balance', width: 18 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Days Overdue', key: 'daysOverdue', width: 15 },
    ];

    // Add rows
    data.forEach((item) => {
      worksheet.addRow({
        clientName: item.clientName,
        invoiceNumber: item.invoiceNumber,
        invoiceDate: this.formatDate(item.invoiceDate),
        dueDate: this.formatDate(item.dueDate),
        totalAmount: this.formatCurrency(item.totalAmount),
        amountPaid: this.formatCurrency(item.amountPaid),
        balance: this.formatCurrency(item.balance),
        status: item.status,
        daysOverdue: item.daysOverdue,
      });
    });

    // Add total row
    const totalRow = worksheet.addRow({
      clientName: 'TOTAL',
      invoiceNumber: '',
      invoiceDate: '',
      dueDate: '',
      totalAmount: this.formatCurrency(
        data.reduce((sum, item) => sum + parseFloat(item.totalAmount || 0), 0),
      ),
      amountPaid: this.formatCurrency(
        data.reduce((sum, item) => sum + parseFloat(item.amountPaid || 0), 0),
      ),
      balance: this.formatCurrency(
        data.reduce((sum, item) => sum + parseFloat(item.balance || 0), 0),
      ),
      status: '',
      daysOverdue: '',
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
  }

  private addRevenueByClientSheet(worksheet: ExcelJS.Worksheet, data: any[]) {
    worksheet.columns = [
      { header: 'Client Name', key: 'clientName', width: 30 },
      { header: 'Location', key: 'location', width: 30 },
      { header: 'Total Invoiced (KES)', key: 'totalInvoiced', width: 20 },
      { header: 'Total Paid (KES)', key: 'totalPaid', width: 20 },
      { header: 'Total Outstanding (KES)', key: 'totalOutstanding', width: 22 },
      { header: 'Invoice Count', key: 'invoiceCount', width: 15 },
    ];

    data.forEach((item) => {
      worksheet.addRow({
        clientName: item.clientName,
        location: item.location,
        totalInvoiced: this.formatCurrency(item.totalInvoiced),
        totalPaid: this.formatCurrency(item.totalPaid),
        totalOutstanding: this.formatCurrency(item.totalOutstanding),
        invoiceCount: item.invoiceCount,
      });
    });

    // Add total row
    const totalRow = worksheet.addRow({
      clientName: 'TOTAL',
      location: '',
      totalInvoiced: this.formatCurrency(
        data.reduce(
          (sum, item) => sum + parseFloat(item.totalInvoiced || 0),
          0,
        ),
      ),
      totalPaid: this.formatCurrency(
        data.reduce((sum, item) => sum + parseFloat(item.totalPaid || 0), 0),
      ),
      totalOutstanding: this.formatCurrency(
        data.reduce(
          (sum, item) => sum + parseFloat(item.totalOutstanding || 0),
          0,
        ),
      ),
      invoiceCount: data.reduce(
        (sum, item) => sum + parseInt(item.invoiceCount || 0),
        0,
      ),
    });

    totalRow.font = { bold: true };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    this.styleHeader(worksheet);
    this.applyBorders(worksheet);
  }

  private addRevenueByLocationSheet(worksheet: ExcelJS.Worksheet, data: any[]) {
    worksheet.columns = [
      { header: 'City', key: 'city', width: 20 },
      { header: 'Region', key: 'region', width: 20 },
      { header: 'Total Invoiced (KES)', key: 'totalInvoiced', width: 20 },
      { header: 'Total Paid (KES)', key: 'totalPaid', width: 20 },
      { header: 'Total Outstanding (KES)', key: 'totalOutstanding', width: 22 },
      { header: 'Client Count', key: 'clientCount', width: 15 },
      { header: 'Invoice Count', key: 'invoiceCount', width: 15 },
    ];

    data.forEach((item) => {
      worksheet.addRow({
        city: item.city,
        region: item.region,
        totalInvoiced: this.formatCurrency(item.totalInvoiced),
        totalPaid: this.formatCurrency(item.totalPaid),
        totalOutstanding: this.formatCurrency(item.totalOutstanding),
        clientCount: item.clientCount,
        invoiceCount: item.invoiceCount,
      });
    });

    // Add total row
    const totalRow = worksheet.addRow({
      city: 'TOTAL',
      region: '',
      totalInvoiced: this.formatCurrency(
        data.reduce(
          (sum, item) => sum + parseFloat(item.totalInvoiced || 0),
          0,
        ),
      ),
      totalPaid: this.formatCurrency(
        data.reduce((sum, item) => sum + parseFloat(item.totalPaid || 0), 0),
      ),
      totalOutstanding: this.formatCurrency(
        data.reduce(
          (sum, item) => sum + parseFloat(item.totalOutstanding || 0),
          0,
        ),
      ),
      clientCount: data.reduce(
        (sum, item) => sum + parseInt(item.clientCount || 0),
        0,
      ),
      invoiceCount: data.reduce(
        (sum, item) => sum + parseInt(item.invoiceCount || 0),
        0,
      ),
    });

    totalRow.font = { bold: true };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    this.styleHeader(worksheet);
    this.applyBorders(worksheet);
  }

  private addPettyCashSheet(worksheet: ExcelJS.Worksheet, data: any[]) {
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Type', key: 'type', width: 10 },
      { header: 'Amount (KES)', key: 'amount', width: 18 },
      { header: 'Purpose', key: 'purpose', width: 35 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Source', key: 'source', width: 20 },
      { header: 'Balance (KES)', key: 'balance', width: 18 },
      { header: 'Entered By', key: 'enteredBy', width: 20 },
    ];

    data.forEach((item) => {
      const row = worksheet.addRow({
        date: this.formatDate(item.date),
        type: item.type,
        amount: this.formatCurrency(item.amount),
        purpose: item.purpose,
        category: item.category,
        source: item.source,
        balance: this.formatCurrency(item.balance),
        enteredBy: item.enteredBy,
      });

      // Color code IN vs OUT
      if (item.type === 'IN') {
        row.getCell('type').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFC6EFCE' }, // Light green
        };
      } else {
        row.getCell('type').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFC7CE' }, // Light red
        };
      }
    });

    // Add summary row
    const totalIn = data
      .filter((item) => item.type === 'IN')
      .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const totalOut = data
      .filter((item) => item.type === 'OUT')
      .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

    worksheet.addRow({});
    const summaryRow = worksheet.addRow({
      date: 'SUMMARY',
      type: '',
      amount: '',
      purpose: `Total IN: ${this.formatCurrency(totalIn)} | Total OUT: ${this.formatCurrency(totalOut)}`,
      category: '',
      source: '',
      balance:
        data.length > 0
          ? this.formatCurrency(data[data.length - 1].balance)
          : '0.00',
      enteredBy: '',
    });

    summaryRow.font = { bold: true };
    summaryRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    this.styleHeader(worksheet);
    this.applyBorders(worksheet);
  }

  private addOtherIncomeSheet(worksheet: ExcelJS.Worksheet, data: any[]) {
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Source', key: 'source', width: 25 },
      { header: 'Item Type', key: 'itemType', width: 25 },
      { header: 'Unit Price (KES)', key: 'unitPrice', width: 18 },
      { header: 'Quantity', key: 'quantity', width: 15 },
      { header: 'Total (KES)', key: 'total', width: 18 },
      { header: 'Entered By', key: 'enteredBy', width: 20 },
    ];

    data.forEach((item) => {
      worksheet.addRow({
        date: this.formatDate(item.date),
        source: item.source,
        itemType: item.itemType,
        unitPrice: this.formatCurrency(item.unitPrice),
        quantity: item.quantity,
        total: this.formatCurrency(item.total),
        enteredBy: item.enteredBy,
      });
    });

    // Add total row
    const totalRow = worksheet.addRow({
      date: 'TOTAL',
      source: '',
      itemType: '',
      unitPrice: '',
      quantity: data.reduce(
        (sum, item) => sum + parseFloat(item.quantity || 0),
        0,
      ),
      total: this.formatCurrency(
        data.reduce((sum, item) => sum + parseFloat(item.total || 0), 0),
      ),
      enteredBy: '',
    });

    totalRow.font = { bold: true };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    this.styleHeader(worksheet);
    this.applyBorders(worksheet);
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
    worksheet.eachRow((row, rowNumber) => {
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
