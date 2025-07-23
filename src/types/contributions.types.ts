export type ContributionType = "maintenance" | "works";

export interface Contribution {
  id: number;
  lotId: string | number;
  type: ContributionType;
  amount: number;
  date: Date;
  description: string;
  receiptNumber?: string | null;
}
