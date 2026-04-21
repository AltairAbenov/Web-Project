import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Budget } from '../models/budget';
import { CategoryService } from './category';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private _budgets = signal<Budget[]>([]);
  private apiUrl = environment.apiUrl + '/budgets';

  budgets = this._budgets.asReadonly();

  constructor(private http: HttpClient, private catService: CategoryService) {
    this.loadAll();
  }

  loadAll(): void {
    this.http.get<any[]>(`${this.apiUrl}/`).subscribe({
      next: budgets => this._budgets.set(budgets.map(b => this.mapFromApi(b))),
      error: () => {}
    });
  }

  getAll(): Budget[] {
    return this._budgets();
  }

  getCurrentMonth(): Budget[] {
    const now = new Date();
    return this._budgets().filter(b => b.month === now.getMonth() && b.year === now.getFullYear());
  }

  add(b: Omit<Budget, 'id' | 'spent'>): void {
    const monthStr = `${b.year}-${String(b.month + 1).padStart(2, '0')}-01`;
    const body = {
      category: b.category_id,
      amount_limit: b.amount,
      month: monthStr,
    };
    this.http.post<any>(`${this.apiUrl}/`, body).subscribe(newB => {
      this._budgets.update(all => [...all, this.mapFromApi(newB)]);
    });
  }

  delete(id: number): void {
    this.http.delete(`${this.apiUrl}/${id}/`).subscribe(() => {
      this._budgets.update(all => all.filter(b => b.id !== id));
    });
  }

  private mapFromApi(b: any): Budget {
    const d = new Date(b.month);
    const cat = this.catService.getById(b.category);
    return {
      id: b.id,
      category_id: b.category,
      category_name: b.category_name || cat?.name || '?',
      amount: Number(b.amount_limit),
      spent: Number(b.spent || 0),
      month: d.getMonth(),
      year: d.getFullYear(),
    };
  }
}