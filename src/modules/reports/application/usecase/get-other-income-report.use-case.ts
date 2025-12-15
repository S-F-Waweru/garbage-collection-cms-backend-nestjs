// application/use-cases/get-other-income-report.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { IReportRepository } from '../../domain/report.repository.interface';
import { ReportResult, ReportType } from '../../domain/report-result.entity';

@Injectable()
export class GetOtherIncomeReportUseCase {
  constructor(
    @Inject('IReportRepository')
    private readonly reportRepo: IReportRepository,
  ) {}

  async execute(filters?: any): Promise<ReportResult> {
    const data = await this.reportRepo.getOtherIncome(filters);

    return ReportResult.create({
      type: ReportType.OTHER_INCOME,
      data,
      generatedAt: new Date(),
      filters: filters || {},
      totalRecords: data.length,
    });
  }
}
