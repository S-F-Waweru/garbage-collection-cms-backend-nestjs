// application/use-cases/get-petty-cash-report.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { IReportRepository } from '../../domain/report.repository.interface';
import { ReportResult, ReportType } from '../../domain/report-result.entity';

@Injectable()
export class GetPettyCashReportUseCase {
  constructor(
    @Inject(IReportRepository)
    private readonly reportRepo: IReportRepository,
  ) {}

  async execute(filters?: any): Promise<ReportResult> {
    const data = await this.reportRepo.getPettyCashSummary(filters);

    return ReportResult.create({
      type: ReportType.PETTY_CASH,
      data,
      generatedAt: new Date(),
      filters: filters || {},
      totalRecords: data.length,
    });
  }
}
