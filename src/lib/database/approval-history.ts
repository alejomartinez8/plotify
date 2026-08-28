import prisma from "@/lib/prisma";
import {
  ApprovalAction,
  ApprovalHistoryEntry,
  ApprovalRecordType,
} from "@/types/approvals.types";

/**
 * Retrieves the approval history (approve/reject/unapprove) for a single
 * income or expense record, newest first. This is the audit trail — who
 * validated the record, what they decided, and when.
 */
export async function getApprovalHistory(
  recordType: ApprovalRecordType,
  recordId: number
): Promise<ApprovalHistoryEntry[]> {
  try {
    const entries = await prisma.approvalHistory.findMany({
      where: { recordType, recordId },
      orderBy: { createdAt: "desc" },
    });
    return entries.map((entry) => ({
      ...entry,
      recordType: entry.recordType as ApprovalRecordType,
      action: entry.action as ApprovalAction,
      createdAt: entry.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching approval history:", error);
    return [];
  }
}
