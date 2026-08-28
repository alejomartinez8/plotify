import { ApprovalFields } from "@/types/approvals.types";

export type ExpenseType = "maintenance" | "works" | "others";

export interface Expense extends ApprovalFields {
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
