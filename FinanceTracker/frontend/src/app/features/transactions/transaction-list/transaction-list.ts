import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../core/services/transaction';
import { CategoryService } from '../../../core/services/category';
import { Transaction } from '../../../core/models/transaction';
import { getIcon, ICONS } from '../../../core/icons/icons';
import { SafeHtmlPipe } from '../../../core/pipes/safe-html.pipe';

type SortField = 'date' | 'amount';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-transaction-list',
  imports: [FormsModule, SafeHtmlPipe],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.css',
})
export class TransactionList {
  filterType = signal<'all' | 'income' | 'expense'>('all');
  searchQuery = signal('');
  showForm = signal(false);
  editingTxn = signal<Transaction | null>(null);

  // Sorting
  sortField = signal<SortField>('date');
  sortDir = signal<SortDir>('desc');

  // Form fields
  formAmount = '';
  formType: 'income' | 'expense' = 'expense';
  formCategoryId = 0;
  formDescription = '';
  formDate = new Date().toISOString().split('T')[0];

  // Icons
  iconEdit = ICONS.edit;
  iconTrash = ICONS.trash;
  iconArrowUpDown = ICONS.arrowUpDown;

  constructor(public txnService: TransactionService, public catService: CategoryService) {}

  getIconSvg(key: string): string {
    return getIcon(key, 16);
  }

  filteredTransactions = computed(() => {
    let txns = this.txnService.getWithCategory();
    const ft = this.filterType();
    const q = this.searchQuery().toLowerCase();
    const sf = this.sortField();
    const sd = this.sortDir();

    if (ft !== 'all') txns = txns.filter(t => t.type === ft);
    if (q) txns = txns.filter(t =>
      t.description.toLowerCase().includes(q) || t.category_name.toLowerCase().includes(q)
    );

    // Sort
    txns = [...txns].sort((a, b) => {
      let cmp = 0;
      if (sf === 'amount') {
        cmp = a.amount - b.amount;
      } else {
        cmp = a.date.localeCompare(b.date);
      }
      return sd === 'asc' ? cmp : -cmp;
    });

    return txns;
  });

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ₸';
  }

  setFilter(f: 'all' | 'income' | 'expense') { this.filterType.set(f); }
  setSearch(q: string) { this.searchQuery.set(q); }

  toggleSort(field: SortField): void {
    if (this.sortField() === field) {
      this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDir.set('desc');
    }
  }

  getSortIndicator(field: SortField): string {
    if (this.sortField() !== field) return '';
    return this.sortDir() === 'asc' ? ' ↑' : ' ↓';
  }

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
        category_id: Number(this.formCategoryId),
        description: this.formDescription,
        date: this.formDate,
      });
    } else {
      this.txnService.add({
        amount,
        type: this.formType,
        category_id: Number(this.formCategoryId),
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
