// application/use-cases/export-report-to-excel.use-case.ts
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { ReportType } from '../../domain/entities/report-result.entity';

@Injectable()
export class ExportReportToExcelUseCase {
  async execute(reportType: ReportType, data: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(reportType);

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
    }

    return await workbook.xlsx.writeBuffer() as Buffer;
  }

  private addOutstandingBalancesSheet(worksheet: ExcelJS.Worksheet, data: any[]) {
    worksheet.columns = [
      { header: 'Client Name', key: 'clientName', width: 30 },
      { header: 'Invoice Number', key: 'invoiceNumber', width: 15 },
      { header: 'Invoice Date', key: 'invoiceDate', width: 15 },
      { header: 'Due Date', key: 'dueDate', width: 15 },
      { header: 'Total Amount', key: 'totalAmount', width: 15 },
      { header: 'Amount Paid', key: 'amountPaid', width: 15 },
      { header: 'Balance', key: 'balance', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Days Overdue', key: 'daysOverdue', width: 15 },
    ];

    worksheet.addRows(data);
    this.styleHeader(worksheet);
  }

  private addRevenueByClientSheet(worksheet: ExcelJS.Worksheet, data: any[]) {
    worksheet.columns = [
      { header: 'Client Name', key: 'clientName', width: 30 },
      { header: 'Location', key: 'location', width: 30 },
      { header: 'Total Invoiced', key: 'totalInvoiced', width: 15 },
      { header: 'Total Paid', key: 'totalPaid', width: 15 },
      { header: 'Total Outstanding', key: 'totalOutstanding', width: 15 },
      { header: 'Invoice Count', key: 'invoiceCount', width: 15 },
    ];

    worksheet.addRows(data);
    this.styleHeader(worksheet);
  }

  private addRevenueByLocationSheet(worksheet: ExcelJS.Worksheet, data: any[]) {
    worksheet.columns = [
      { header: 'City', key: 'city', width: 20 },
      { header: 'Region', key: 'region', width: 20 },
      { header: 'Total Invoiced', key: 'totalInvoiced', width: 15 },
      { header: 'Total Paid', key: 'totalPaid', width: 15 },
      { header: 'Total Outstanding', key: 'totalOutstanding', width: 15 },
      { header: 'Client Count', key: 'clientCount', width: 15 },
      { header: 'Invoice Count', key: 'invoiceCount', width: 15 },
    ];

    worksheet.addRows(data);
    this.styleHeader(worksheet);
  }

  private addPettyCashSheet(worksheet: ExcelJS.Worksheet, data: any[]) {
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Type', key: 'type', width: 10 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Purpose', key: 'purpose', width: 30 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Source', key: 'source', width: 20 },
      { header: 'Balance', key: 'balance', width: 15 },
      { header: 'Entered By', key: 'enteredBy', width: 20 },
    ];

    worksheet.addRows(data);
    this.styleHeader(worksheet);
  }

  private addOtherIncomeSheet(worksheet: ExcelJS.Worksheet, data: any[]) {
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Source', key: 'source', width: 20 },
      { header: 'Item Type', key: 'itemType', width: 20 },
      { header: 'Unit Price', key: 'unitPrice', width: 15 },
      { header: 'Quantity', key: 'quantity', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Entered By', key: 'enteredBy', width: 20 },
    ];

    worksheet.addRows(data);
    this.styleHeader(worksheet);
  }

  private styleHeader(worksheet: ExcelJS.Worksheet) {
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
