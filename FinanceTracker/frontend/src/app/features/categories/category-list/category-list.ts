import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category';

@Component({
  selector: 'app-category-list',
  imports: [FormsModule],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
})
export class CategoryList {
  showForm = signal(false);
  formName = '';
  formType: 'income' | 'expense' = 'expense';
  formIcon = '📦';
  formColor = '#6366f1';

  icons = ['💰', '💳', '💻', '📈', '🎁', '🛒', '🚗', '🎬', '🏠', '💊', '👕', '📚', '🍽️', '✈️', '🎮', '🐾', '💇', '📱', '🏋️', '🎵', '📦', '🔧'];
  colors = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#14b8a6', '#64748b'];

  constructor(public catService: CategoryService) {}

  get incomeCategories() { return this.catService.getByType('income'); }
  get expenseCategories() { return this.catService.getByType('expense'); }

  openAdd(): void {
    this.formName = '';
    this.formType = 'expense';
    this.formIcon = '📦';
    this.formColor = '#6366f1';
    this.showForm.set(true);
  }

  save(): void {
    if (!this.formName.trim()) return;
    this.catService.add({
      name: this.formName.trim(),
      type: this.formType,
      icon: this.formIcon,
      color: this.formColor,
    });
    this.showForm.set(false);
  }

  deleteCategory(id: number): void {
    this.catService.delete(id);
  }
}
