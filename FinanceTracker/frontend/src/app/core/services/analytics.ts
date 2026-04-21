import { Injectable } from '@angular/core';
import { TransactionService } from './transaction';

export interface MonthlyData {
  label: string;
  income: number;
  expense: number;
  month: number;
  year: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(private txnService: TransactionService) {}

  getLastNMonths(n: number): MonthlyData[] {
    const months: MonthlyData[] = [];
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const txns = this.txnService.getByMonth(d.getFullYear(), d.getMonth());
      months.push({
        label: monthNames[d.getMonth()],
        income: txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
        month: d.getMonth(),
        year: d.getFullYear()
      });
    }
    return months;
  }

  getLast6Months(): MonthlyData[] {
    return this.getLastNMonths(6);
  }
}
