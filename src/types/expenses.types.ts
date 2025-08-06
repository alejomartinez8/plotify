export type ExpenseType = "general";

export interface Expense {
  id: number;
  type: ExpenseType;
  amount: number;
  date: string;
  description: string;
  category: string;
  receiptNumber?: string | null;
  receiptFileId?: string | null;
  receiptFileUrl?: string | null;
  receiptFileName?: string | null;
}
