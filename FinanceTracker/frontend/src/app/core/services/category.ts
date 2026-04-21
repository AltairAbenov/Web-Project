import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category } from '../models/category';
import { environment } from '../../../environments/environment';

const FALLBACK_META: Record<string, { type: 'income' | 'expense'; color: string }> = {
  'Salary':        { type: 'income',  color: '#22c55e' },
  'Freelance':     { type: 'income',  color: '#06b6d4' },
  'Investments':   { type: 'income',  color: '#8b5cf6' },
  'Gifts':         { type: 'income',  color: '#f59e0b' },
  'Products':      { type: 'expense', color: '#ef4444' },
  'Transport':     { type: 'expense', color: '#f97316' },
  'Entertainment': { type: 'expense', color: '#ec4899' },
  'Utility bills': { type: 'expense', color: '#64748b' },
  'Health':        { type: 'expense', color: '#14b8a6' },
  'Clothes':       { type: 'expense', color: '#a855f7' },
  'Education':     { type: 'expense', color: '#3b82f6' },
  'Restaurants':   { type: 'expense', color: '#e11d48' },
};

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private _categories = signal<Category[]>([]);
  private apiUrl = environment.apiUrl + '/categories';

  categories = this._categories.asReadonly();

  constructor(private http: HttpClient) {
    this.loadAll();
  }

  loadAll(): void {
    this.http.get<any[]>(`${this.apiUrl}/`).subscribe({
      next: cats => this._categories.set(cats.map(c => this.mapFromApi(c))),
      error: () => {}
    });
  }

  getAll(): Category[] {
    return this._categories();
  }

  getById(id: number): Category | undefined {
    return this._categories().find(c => c.id === id);
  }

  getByType(type: 'income' | 'expense'): Category[] {
    return this._categories().filter(c => c.type === type);
  }

  add(cat: Omit<Category, 'id'>): void {
    const body = {
      name: cat.name,
      icon: cat.icon,
      type: cat.type,
      color: cat.color,
    };
    this.http.post<any>(`${this.apiUrl}/`, body).subscribe(newCat => {
      this._categories.update(all => [...all, this.mapFromApi(newCat)]);
    });
  }

  delete(id: number): void {
    this.http.delete(`${this.apiUrl}/${id}/`).subscribe(() => {
      this._categories.update(all => all.filter(c => c.id !== id));
    });
  }

  private mapFromApi(c: any): Category {
    const fallback = FALLBACK_META[c.name] || { type: 'expense', color: '#6366f1' };
    return {
      id: c.id,
      name: c.name,
      icon: c.icon || 'box',
      type: c.type || fallback.type,
      color: c.color || fallback.color,
    };
  }
}