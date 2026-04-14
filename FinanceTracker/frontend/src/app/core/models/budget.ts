export interface Budget {
  id: number;
  category_id: number;
  category_name?: string;
  amount: number;
  spent: number;
  month: number;
  year: number;
}