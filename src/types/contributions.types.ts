export type ContributionType = "maintenance" | "works" | "others";

export interface Contribution {
  id: number;
  lotId: string | number;
  type: ContributionType;
  amount: number;
  date: string;
  description: string;
  receiptNumber?: string | null;
}
