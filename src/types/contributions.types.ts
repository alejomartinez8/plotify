import { ApprovalFields } from "@/types/approvals.types";

export type ContributionType = "maintenance" | "works" | "others";

export interface Contribution extends ApprovalFields {
  id: number;
  lotId: string | number;
  type: ContributionType;
  amount: number;
  date: string;
  description: string;
  receiptNumber?: string | null;
  receiptFileId?: string | null;
  receiptFileUrl?: string | null;
  receiptFileName?: string | null;
}
