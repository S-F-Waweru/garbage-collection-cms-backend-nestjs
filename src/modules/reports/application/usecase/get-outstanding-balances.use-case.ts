// application/use-cases/get-outstanding-balances.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { IReportRepository } from '../../domain/report.repository.interface';
import { ReportResult, ReportType } from '../../domain/report-result.entity';


@Injectable()
export class GetOutstandingBalancesUseCase {
  constructor(
    @Inject('IReportRepository')
    private readonly reportRepo: IReportRepository,
  ) {}

  async execute(filters?: any): Promise<ReportResult> {
    const data = await this.reportRepo.getOutstandingBalances(filters);

    return ReportResult.create({
      type: ReportType.OUTSTANDING_BALANCES,
      data,
      generatedAt: new Date(),
      filters: filters || {},
      totalRecords: data.length,
    });
  }
}
