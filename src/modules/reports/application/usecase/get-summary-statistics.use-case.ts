// application/use-cases/get-summary-statistics.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { IReportRepository } from '../../domain/report.repository.interface';
import {
  ReportResult,
  ReportType,
} from '../../domain/entities/report-result.entity';

@Injectable()
export class GetSummaryStatisticsUseCase {
  constructor(
    @Inject('IReportRepository')
    private readonly reportRepo: IReportRepository,
  ) {}

  async execute(filters?: any): Promise<ReportResult> {
    const data = await this.reportRepo.getSummaryStatistics(filters);

    return ReportResult.create({
      type: ReportType.SUMMARY,
      data,
      generatedAt: new Date(),
      filters: filters || {},
      totalRecords: 1,
    });
  }
}
