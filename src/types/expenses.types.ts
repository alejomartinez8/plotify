export interface Expense {
  id: number;
  type: 'maintenance' | 'works';
  amount: number;
  date: string;
  description: string;
  category: string;
}
