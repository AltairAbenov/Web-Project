import { Injectable, signal } from '@angular/core';
import { Category } from '../models/category';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: 'Salary', type: 'income', icon: 'salary', color: '#22c55e' },
  { id: 2, name: 'Freelance', type: 'income', icon: 'freelance', color: '#06b6d4' },
  { id: 3, name: 'Investments', type: 'income', icon: 'investments', color: '#8b5cf6' },
  { id: 4, name: 'Gifts', type: 'income', icon: 'gifts', color: '#f59e0b' },
  { id: 5, name: 'Products', type: 'expense', icon: 'products', color: '#ef4444' },
  { id: 6, name: 'Transport', type: 'expense', icon: 'transport', color: '#f97316' },
  { id: 7, name: 'Entertainment', type: 'expense', icon: 'entertainment', color: '#ec4899' },
  { id: 8, name: 'Utility bills', type: 'expense', icon: 'utilities', color: '#64748b' },
  { id: 9, name: 'Health', type: 'expense', icon: 'health', color: '#14b8a6' },
  { id: 10, name: 'Clothes', type: 'expense', icon: 'clothes', color: '#a855f7' },
  { id: 11, name: 'Education', type: 'expense', icon: 'education', color: '#3b82f6' },
  { id: 12, name: 'Restaurants', type: 'expense', icon: 'restaurants', color: '#e11d48' },
];

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private _categories = signal<Category[]>(this.load());

  categories = this._categories.asReadonly();

  getAll(): Category[] {
    return this._categories();
  }

  getById(id: number): Category | undefined {
    return this._categories().find(c => c.id === id);
  }

  getByType(type: 'income' | 'expense'): Category[] {
    return this._categories().filter(c => c.type === type);
  }

  add(cat: Omit<Category, 'id'>): Category {
    const all = this._categories();
    const newCat: Category = { ...cat, id: Math.max(0, ...all.map(c => c.id)) + 1 };
    const updated = [...all, newCat];
    this._categories.set(updated);
    this.save(updated);
    return newCat;
  }

  delete(id: number): void {
    const updated = this._categories().filter(c => c.id !== id);
    this._categories.set(updated);
    this.save(updated);
  }

  private load(): Category[] {
    try {
      const s = sessionStorage.getItem('ft_categories');
      return s ? JSON.parse(s) : [...DEFAULT_CATEGORIES];
    } catch { return [...DEFAULT_CATEGORIES]; }
  }

  private save(cats: Category[]): void {
    try { sessionStorage.setItem('ft_categories', JSON.stringify(cats)); } catch {}
  }
}
