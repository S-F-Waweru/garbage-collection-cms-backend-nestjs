// application/use-cases/get-revenue-report.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { IReportRepository } from '../../domain/report.repository.interface';
import { ReportResult, ReportType } from '../../domain/entities/report-result.entity';
import { RevenueGroupBy } from '../dto/revenue-report-filters.dto';

@Injectable()
export class GetRevenueReportUseCase {
  constructor(
    @Inject('IReportRepository')
    private readonly reportRepo: IReportRepository,
  ) {}

  async execute(groupBy: RevenueGroupBy, filters?: any): Promise<ReportResult> {
    let data;
    let reportType;

    if (groupBy === RevenueGroupBy.CLIENT) {
      data = await this.reportRepo.getRevenueByClient(filters);
      reportType = ReportType.REVENUE_BY_CLIENT;
    } else {
      data = await this.reportRepo.getRevenueByLocation(filters);
      reportType = ReportType.REVENUE_BY_LOCATION;
    }

    return ReportResult.create({
      type: reportType,
      data,
      generatedAt: new Date(),
      filters: { ...filters, groupBy },
      totalRecords: data.length,
    });
  }
}