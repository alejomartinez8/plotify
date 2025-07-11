export type ContributionType = 'maintenance' | 'works';

export interface Contribution {
  id: number;
  lotId: string | number;
  type: ContributionType;
  amount: number;
  month: string;
  year: number;
  date: string;
  description: string;
}
