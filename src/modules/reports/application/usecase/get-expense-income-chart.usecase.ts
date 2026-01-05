import { Inject, Injectable } from '@nestjs/common';
import { IncomeRecordRepository } from '../../../other-income/income-record/infrastructure/schema/repository/income-record.repository';
import { ExpenseRepository } from '../../../expences/expence/infrastructure/expense.repository';
import { Expense } from '../../../expences/expence/domain/expense.entity';

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

    // Calculate averages
    const avgIncome = this.calculateAverage(incomeData);
    const avgExpense = this.calculateAverage(expenseData);

    // Calculate growth rate (comparing first half vs second half of year)
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
    const sum = data.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / data.length);
  }

  private calculateGrowthRate(
    incomeData: number[],
    expenseData: number[],
  ): number {
    // Net profit = income - expenses
    const netProfit = incomeData.map((income, i) => income - expenseData[i]);

    // First half vs second half
    const firstHalf = netProfit.slice(0, 6).reduce((a, b) => a + b, 0);
    const secondHalf = netProfit.slice(6, 12).reduce((a, b) => a + b, 0);

    if (firstHalf === 0) return 0;

    // Growth rate percentage
    const growth = ((secondHalf - firstHalf) / Math.abs(firstHalf)) * 100;
    return Math.round(growth * 100) / 100; // Round to 2 decimals
  }
}

export interface ExpenseIncomeChartData {
  incomeData: number[];
  expenseData: number[];
  avgIncome: number;
  avgExpense: number;
  growthRate: number;
}
