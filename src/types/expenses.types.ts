import { ContributionType } from "./contributions.types";

export interface Expense {
  id: number;
  type: ContributionType;
  amount: number;
  date: string;
  description: string;
  category: string;
  receiptNumber?: string | null;
  receiptFileId?: string | null;
  receiptFileUrl?: string | null;
  receiptFileName?: string | null;
}
