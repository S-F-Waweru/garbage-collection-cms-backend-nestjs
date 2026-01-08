import { Injectable, Inject } from '@nestjs/common';
import { IReportRepository } from '../../domain/report.repository.interface';
import { ReportType, ReportResult } from '../../domain/report-result.entity';

@Injectable()
export class GetPaymentReportUseCase {
  constructor(
    @Inject(IReportRepository)
    private readonly reportRepository: IReportRepository,
  ) {}

  async execute(filters?: {
    startDate?: Date;
    endDate?: Date;
    clientId?: string;
  }): Promise<ReportResult> {
    const payments = await this.reportRepository.getPaymentSummary(filters);

    return ReportResult.create({
      type: ReportType.PAYMENTS,
      data: payments,
      generatedAt: new Date(),
      filters: filters || {},
      totalRecords: payments.length,
    });
  }
}
