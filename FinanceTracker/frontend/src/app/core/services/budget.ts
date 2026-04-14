import { Injectable, signal } from '@angular/core';
import { Budget } from '../models/budget';
import { CategoryService } from './category';
import { TransactionService } from './transaction';

function generateMockBudgets(): Budget[] {
  const now = new Date();
  return [
    { id: 1, category_id: 5, amount: 80000, spent: 0, month: now.getMonth(), year: now.getFullYear() },
    { id: 2, category_id: 6, amount: 30000, spent: 0, month: now.getMonth(), year: now.getFullYear() },
    { id: 3, category_id: 7, amount: 25000, spent: 0, month: now.getMonth(), year: now.getFullYear() },
    { id: 4, category_id: 8, amount: 40000, spent: 0, month: now.getMonth(), year: now.getFullYear() },
    { id: 5, category_id: 12, amount: 35000, spent: 0, month: now.getMonth(), year: now.getFullYear() },
  ];
}

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private _budgets = signal<Budget[]>(this.load());

  budgets = this._budgets.asReadonly();

  constructor(private catService: CategoryService, private txnService: TransactionService) {}

  getAll(): Budget[] {
    return this.withSpent(this._budgets());
  }

  getCurrentMonth(): Budget[] {
    const now = new Date();
    return this.withSpent(
      this._budgets().filter(b => b.month === now.getMonth() && b.year === now.getFullYear())
    );
  }

  add(b: Omit<Budget, 'id' | 'spent'>): Budget {
    const all = this._budgets();
    const newB: Budget = { ...b, spent: 0, id: Math.max(0, ...all.map(x => x.id)) + 1 };
    const updated = [...all, newB];
    this._budgets.set(updated);
    this.save(updated);
    return newB;
  }

  delete(id: number): void {
    const updated = this._budgets().filter(b => b.id !== id);
    this._budgets.set(updated);
    this.save(updated);
  }

  private withSpent(budgets: Budget[]): Budget[] {
    return budgets.map(b => {
      const txns = this.txnService.getByMonth(b.year, b.month)
        .filter(t => t.type === 'expense' && t.category_id === b.category_id);
      const spent = txns.reduce((s, t) => s + t.amount, 0);
      const cat = this.catService.getById(b.category_id);
      return { ...b, spent, category_name: cat?.name ?? '?' };
    });
  }

  private load(): Budget[] {
    try {
      const s = sessionStorage.getItem('ft_budgets');
      return s ? JSON.parse(s) : generateMockBudgets();
    } catch { return generateMockBudgets(); }
  }

  private save(b: Budget[]): void {
    try { sessionStorage.setItem('ft_budgets', JSON.stringify(b)); } catch {}
  }
}
