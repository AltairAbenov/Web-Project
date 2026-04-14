import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../core/services/transaction';
import { CategoryService } from '../../../core/services/category';
import { Transaction } from '../../../core/models/transaction';

@Component({
  selector: 'app-transaction-list',
  imports: [FormsModule],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.css',
})
export class TransactionList {
  filterType = signal<'all' | 'income' | 'expense'>('all');
  searchQuery = signal('');
  showForm = signal(false);
  editingTxn = signal<Transaction | null>(null);

  // Form fields
  formAmount = '';
  formType: 'income' | 'expense' = 'expense';
  formCategoryId = 0;
  formDescription = '';
  formDate = new Date().toISOString().split('T')[0];

  constructor(public txnService: TransactionService, public catService: CategoryService) {}

  filteredTransactions = computed(() => {
    let txns = this.txnService.getWithCategory();
    const ft = this.filterType();
    const q = this.searchQuery().toLowerCase();
    if (ft !== 'all') txns = txns.filter(t => t.type === ft);
    if (q) txns = txns.filter(t =>
      t.description.toLowerCase().includes(q) || t.category_name.toLowerCase().includes(q)
    );
    return txns;
  });

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ₸';
  }

  setFilter(f: 'all' | 'income' | 'expense') { this.filterType.set(f); }
  setSearch(q: string) { this.searchQuery.set(q); }

  openAdd(): void {
    this.editingTxn.set(null);
    this.formAmount = '';
    this.formType = 'expense';
    this.formCategoryId = 0;
    this.formDescription = '';
    this.formDate = new Date().toISOString().split('T')[0];
    this.showForm.set(true);
  }

  openEdit(t: Transaction): void {
    this.editingTxn.set(t);
    this.formAmount = String(t.amount);
    this.formType = t.type;
    this.formCategoryId = t.category_id;
    this.formDescription = t.description;
    this.formDate = t.date;
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  get formCategories() {
    return this.catService.getByType(this.formType);
  }

  saveTransaction(): void {
    const amount = parseFloat(this.formAmount);
    if (!amount || amount <= 0 || !this.formCategoryId || !this.formDescription) return;

    const editing = this.editingTxn();
    if (editing) {
      this.txnService.update({
        ...editing,
        amount,
        type: this.formType,
        category_id: this.formCategoryId,
        description: this.formDescription,
        date: this.formDate,
      });
    } else {
      this.txnService.add({
        amount,
        type: this.formType,
        category_id: this.formCategoryId,
        description: this.formDescription,
        date: this.formDate,
      });
    }
    this.showForm.set(false);
  }

  deleteTxn(id: number): void {
    this.txnService.delete(id);
  }
}
