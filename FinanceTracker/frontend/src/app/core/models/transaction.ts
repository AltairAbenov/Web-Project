export interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  category_id: number;
  category_name?: string;
  description: string;
  date: string;
  created_at?: string;
}