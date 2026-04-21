import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Transaction } from '../models/transaction';
import { CategoryService } from './category';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private _transactions = signal<Transaction[]>([]);
  private apiUrl = environment.apiUrl + '/transactions';

  transactions = this._transactions.asReadonly();

  totalIncome = computed(() =>
    this._transactions().filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  );

  totalExpense = computed(() =>
    this._transactions().filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  );

  balance = computed(() => this.totalIncome() - this.totalExpense());

  constructor(private http: HttpClient, private catService: CategoryService) {
    this.loadAll();
  }

  loadAll(): void {
    this.http.get<any[]>(`${this.apiUrl}/`).subscribe({
      next: txns => this._transactions.set(txns.map(t => this.mapFromApi(t))),
      error: () => {}
    });
  }

  getAll(): Transaction[] {
    return this._transactions();
  }

  getWithCategory(): (Transaction & { category_name: string; category_icon: string; category_color: string })[] {
    return this._transactions().map(t => {
      const cat = this.catService.getById(t.category_id);
      return {
        ...t,
        category_name: cat?.name || 'No category',
        category_icon: cat?.icon || 'helpCircle',
        category_color: cat?.color || '#94a3b8',
      };
    });
  }

  add(t: Omit<Transaction, 'id' | 'created_at'>): void {
    const body = {
      amount: t.amount,
      type: t.type,
      category: t.category_id,
      description: t.description,
      date: t.date,
    };
    this.http.post<any>(`${this.apiUrl}/`, body).subscribe(newT => {
      this._transactions.update(all =>
        [this.mapFromApi(newT), ...all].sort((a, b) => b.date.localeCompare(a.date))
      );
    });
  }

  update(t: Transaction): void {
    const body = {
      amount: t.amount,
      type: t.type,
      category: t.category_id,
      description: t.description,
      date: t.date,
    };
    this.http.put<any>(`${this.apiUrl}/${t.id}/`, body).subscribe(updated => {
      this._transactions.update(all =>
        all.map(x => x.id === updated.id ? this.mapFromApi(updated) : x)
      );
    });
  }

  delete(id: number): void {
    this.http.delete(`${this.apiUrl}/${id}/`).subscribe(() => {
      this._transactions.update(all => all.filter(x => x.id !== id));
    });
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
      return { category_id: catId, name: cat?.name ?? '?', icon: cat?.icon ?? 'helpCircle', color: cat?.color ?? '#999', total };
    }).sort((a, b) => b.total - a.total);
  }

  private mapFromApi(t: any): Transaction {
    return {
      id: t.id,
      amount: Number(t.amount),
      type: t.type,
      category_id: t.category,
      category_name: t.category_name || undefined,
      description: t.description || '',
      date: t.date,
      created_at: t.created_at,
    };
  }
}