import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BudgetService } from '../../../core/services/budget';
import { CategoryService } from '../../../core/services/category';
import { ICONS } from '../../../core/icons/icons';

@Component({
  selector: 'app-budget-list',
  imports: [FormsModule],
  templateUrl: './budget-list.html',
  styleUrl: './budget-list.css',
})
export class BudgetList {
  showForm = signal(false);
  formCategoryId = 0;
  formAmount = '';

  iconTrash = ICONS.trash;
  iconAlert = ICONS.alertTriangle;

  constructor(public budgetService: BudgetService, public catService: CategoryService) {}

  budgets = computed(() => this.budgetService.getCurrentMonth());
  totalBudget = computed(() => this.budgets().reduce((s, b) => s + b.amount, 0));
  totalSpent = computed(() => this.budgets().reduce((s, b) => s + b.spent, 0));

  get expenseCategories() {
    return this.catService.getByType('expense');
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ₸';
  }

  percent(b: any): number {
    if (!b.amount) return 0;
    return Math.min(100, Math.round((b.spent / b.amount) * 100));
  }

  statusClass(b: any): string {
    const p = this.percent(b);
    if (p > 90) return 'danger';
    if (p > 75) return 'warning';
    return 'normal';
  }

  openAdd(): void {
    this.formCategoryId = 0;
    this.formAmount = '';
    this.showForm.set(true);
  }

  save(): void {
    const amount = parseFloat(this.formAmount);
    if (!amount || !this.formCategoryId) return;
    const now = new Date();
    this.budgetService.add({
      category_id: Number(this.formCategoryId),
      amount,
      month: now.getMonth(),
      year: now.getFullYear(),
    });
    this.showForm.set(false);
  }

  deleteBudget(id: number): void {
    this.budgetService.delete(id);
  }
}
