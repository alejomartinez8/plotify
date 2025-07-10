export interface Contribution {
  id: number;
  lotId: string | number;
  type: 'maintenance' | 'works';
  amount: number;
  month: string;
  year: number;
  date: string;
  description: string;
}
