import { Injectable, signal, computed } from '@angular/core';
import { Transaction } from '../models/transaction';
import { CategoryService } from './category';

function generateMockTransactions(): Transaction[] {
  const now = new Date();
  const transactions: Transaction[] = [];
  const incomeDescs = ['Зарплата за месяц', 'Оплата проекта', 'Дивиденды', 'Подарок'];
  const expenseDescs = ['Супермаркет', 'Такси', 'Кино', 'Электричество', 'Аптека', 'Футболка', 'Курсы', 'Ресторан'];

  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - Math.floor(Math.random() * 90));
    const isIncome = Math.random() > 0.65;
    transactions.push({
      id: i + 1,
      amount: isIncome
        ? Math.round((Math.random() * 400000 + 100000))
        : Math.round((Math.random() * 50000 + 1000)),
      type: isIncome ? 'income' : 'expense',
      category_id: isIncome
        ? Math.ceil(Math.random() * 4)
        : Math.ceil(Math.random() * 8) + 4,
      description: isIncome
        ? incomeDescs[Math.floor(Math.random() * incomeDescs.length)]
        : expenseDescs[Math.floor(Math.random() * expenseDescs.length)],
      date: d.toISOString().split('T')[0],
      created_at: d.toISOString()
    });
  }
  return transactions.sort((a, b) => b.date.localeCompare(a.date));
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private _transactions = signal<Transaction[]>(this.load());

  transactions = this._transactions.asReadonly();

  totalIncome = computed(() =>
    this._transactions().filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  );

  totalExpense = computed(() =>
    this._transactions().filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  );

  balance = computed(() => this.totalIncome() - this.totalExpense());

  constructor(private catService: CategoryService) {}

  getAll(): Transaction[] {
    return this._transactions();
  }

  getWithCategory(): (Transaction & { category_name: string; category_icon: string; category_color: string })[] {
    return this._transactions().map(t => {
      const cat = this.catService.getById(t.category_id);
      return {
        ...t,
        category_name: cat?.name ?? 'Без категории',
        category_icon: cat?.icon ?? '❓',
        category_color: cat?.color ?? '#94a3b8'
      };
    });
  }

  add(t: Omit<Transaction, 'id' | 'created_at'>): Transaction {
    const all = this._transactions();
    const newT: Transaction = { ...t, id: Math.max(0, ...all.map(x => x.id)) + 1, created_at: new Date().toISOString() };
    const updated = [newT, ...all].sort((a, b) => b.date.localeCompare(a.date));
    this._transactions.set(updated);
    this.save(updated);
    return newT;
  }

  update(t: Transaction): void {
    const updated = this._transactions().map(x => x.id === t.id ? { ...t } : x);
    this._transactions.set(updated);
    this.save(updated);
  }

  delete(id: number): void {
    const updated = this._transactions().filter(x => x.id !== id);
    this._transactions.set(updated);
    this.save(updated);
  }

  getByMonth(year: number, month: number): Transaction[] {
    return this._transactions().filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }

  getExpenseByCategory(year: number, month: number): { category_id: number; name: string; icon: string; color: string; total: number }[] {
    const txns = this.getByMonth(year, month).filter(t => t.type === 'expense');
    const map = new Map<number, number>();
    txns.forEach(t => map.set(t.category_id, (map.get(t.category_id) ?? 0) + t.amount));
    return Array.from(map.entries()).map(([catId, total]) => {
      const cat = this.catService.getById(catId);
      return { category_id: catId, name: cat?.name ?? '?', icon: cat?.icon ?? '?', color: cat?.color ?? '#999', total };
    }).sort((a, b) => b.total - a.total);
  }

  private load(): Transaction[] {
    try {
      const s = sessionStorage.getItem('ft_transactions');
      return s ? JSON.parse(s) : generateMockTransactions();
    } catch { return generateMockTransactions(); }
  }

  private save(txns: Transaction[]): void {
    try { sessionStorage.setItem('ft_transactions', JSON.stringify(txns)); } catch {}
  }
}
