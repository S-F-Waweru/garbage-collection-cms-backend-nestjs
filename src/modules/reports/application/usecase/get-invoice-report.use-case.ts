import { Injectable, Inject, Logger } from '@nestjs/common';
import { IReportRepository } from '../../domain/report.repository.interface';
import { ReportType, ReportResult } from '../../domain/report-result.entity';
import { InvoiceStatus } from 'src/modules/invoices/application/models';

@Injectable()
export class GetInvoiceReportUseCase {
  constructor(
    @Inject(IReportRepository)
    private readonly reportRepository: IReportRepository,
  ) {}

  logger = new Logger(GetInvoiceReportUseCase.name);
  async execute(filters?: {
    startDate?: Date;
    endDate?: Date;
    status?: InvoiceStatus;
  }): Promise<ReportResult> {
    this.logger.debug(filters);
    const invoices = await this.reportRepository.getInvoiceSummary(filters);

    return ReportResult.create({
      type: ReportType.INVOICE,
      data: invoices,
      generatedAt: new Date(),
      filters: filters || {},
      totalRecords: invoices.length,
    });
  }
}
