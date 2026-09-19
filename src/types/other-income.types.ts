import { ApprovalFields } from "@/types/approvals.types";
import { ContributionType } from "@/types/contributions.types";

export interface OtherIncome extends ApprovalFields {
  id: number;
  type: ContributionType;
  amount: number;
  date: string;
  description: string;
  receiptNumber?: string | null;
  receiptFileId?: string | null;
  receiptFileName?: string | null;
  receiptFileUrl?: string | null;
}
