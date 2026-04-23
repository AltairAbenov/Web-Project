import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category';
import { getIcon, ICONS, ICON_PICKER_KEYS } from '../../../core/icons/icons';
import { SafeHtmlPipe } from '../../../core/pipes/safe-html.pipe';

@Component({
  selector: 'app-category-list',
  imports: [FormsModule, SafeHtmlPipe],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
})
export class CategoryList implements OnInit {
  showForm = signal(false);
  formName = '';
  formType: 'income' | 'expense' = 'expense';
  formIcon = 'box';
  formColor = '#6366f1';
  formError = signal('');

  iconKeys = ICON_PICKER_KEYS;
  colors = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#14b8a6', '#64748b'];

  iconIncomeHeader = ICONS.incomeHeader;
  iconExpenseHeader = ICONS.expenseHeader;

  constructor(public catService: CategoryService) {}

  getIconSvg(key: string, size = 20): string {
    return getIcon(key, size);
  }

  getIconSized(key: string, size: number): string {
    const icon = getIcon(key, size);
    return icon.replace(/width="\d+"/, `width="${size}"`).replace(/height="\d+"/, `height="${size}"`);
  }

  ngOnInit(): void {
    this.catService.loadAll();
  }

  get incomeCategories() { return this.catService.getByType('income'); }
  get expenseCategories() { return this.catService.getByType('expense'); }

  openAdd(): void {
    this.formName = '';
    this.formType = 'expense';
    this.formIcon = 'box';
    this.formColor = '#6366f1';
    this.showForm.set(true);
    this.formError.set('');
  }

  save(): void {
  if (!this.formName.trim()) {
    this.formError.set('Enter a category name');
    return;
  }
  this.formError.set('');
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
