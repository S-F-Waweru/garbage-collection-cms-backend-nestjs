import { Inject, Injectable } from '@nestjs/common';
import { IncomeRecordRepository } from '../../../other-income/income-record/infrastructure/schema/repository/income-record.repository';
import { ExpenseRepository } from '../../../expences/expence/infrastructure/expense.repository';

@Injectable()
export class GetExpenseIncomeChartUseCase {
  constructor(
    @Inject(IncomeRecordRepository)
    private readonly incomeRecordRepository: IncomeRecordRepository,
    @Inject(ExpenseRepository)
    private readonly expenseRepository: ExpenseRepository,
  ) {}

  async execute(year: number) {
    const incomeData = await this.incomeRecordRepository.getMonthlyTotals(year);
    const expenseData = await this.expenseRepository.getMonthlyTotals(year);

    // Calculate averages in cents
    const avgIncome = this.calculateAverage(incomeData);
    const avgExpense = this.calculateAverage(expenseData);

    // Calculate growth rate safely using cents
    const growthRate = this.calculateGrowthRate(incomeData, expenseData);

    return {
      incomeData,
      expenseData,
      avgIncome,
      avgExpense,
      growthRate,
    };
  }

  private calculateAverage(data: number[]): number {
    const sumCents = data.reduce((acc, val) => acc + Math.round(val * 100), 0);
    return sumCents / data.length / 100;
  }

  private calculateGrowthRate(
    incomeData: number[],
    expenseData: number[],
  ): number {
    // Convert all to cents to avoid float errors
    const netProfitCents = incomeData.map(
      (income, i) =>
        Math.round(income * 100) - Math.round(expenseData[i] * 100),
    );

    const firstHalf = netProfitCents.slice(0, 6).reduce((a, b) => a + b, 0);
    const secondHalf = netProfitCents.slice(6, 12).reduce((a, b) => a + b, 0);

    if (firstHalf === 0) return 0;

    // Growth rate in percentage
    const growth = ((secondHalf - firstHalf) / Math.abs(firstHalf)) * 100;
    return Math.round(growth * 100) / 100; // round to 2 decimals
  }
}

export interface ExpenseIncomeChartData {
  incomeData: number[];
  expenseData: number[];
  avgIncome: number;
  avgExpense: number;
  growthRate: number;
}
