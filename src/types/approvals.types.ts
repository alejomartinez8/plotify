export type ApprovalStatus = "pending" | "approved" | "rejected";

export type ApprovalRecordType = "contribution" | "expense";

export type ApprovalAction = "approved" | "rejected" | "unapproved";

export interface ApprovalFields {
  approvalStatus: ApprovalStatus;
  approvalNote?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
}

export interface ApprovalHistoryEntry {
  id: string;
  recordType: ApprovalRecordType;
  recordId: number;
  action: ApprovalAction;
  treasurerEmail: string;
  note?: string | null;
  createdAt: string;
}
