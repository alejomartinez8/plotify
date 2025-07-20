export type ContributionType = "maintenance" | "works";

export interface Contribution {
  id: number;
  lotId: string;
  type: string;
  amount: number;
  date: string;
  description: string;
}
