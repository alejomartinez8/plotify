"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, History } from "lucide-react";
import { translations } from "@/lib/translations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { getApprovalHistoryAction } from "@/lib/actions/approval-actions";
import {
  ApprovalHistoryEntry,
  ApprovalRecordType,
} from "@/types/approvals.types";

interface ApprovalHistoryModalProps {
  recordType: ApprovalRecordType;
  recordId: number;
  onClose: () => void;
}

const ACTION_ICON = {
  approved: { Icon: CheckCircle2, className: "text-emerald-600" },
  rejected: { Icon: XCircle, className: "text-destructive" },
  unapproved: { Icon: RotateCcw, className: "text-orange-600" },
};

const ACTION_LABEL = {
  approved: translations.labels.approved,
  rejected: translations.labels.rejected,
  unapproved: translations.actions.unapprove,
};

export default function ApprovalHistoryModal({
  recordType,
  recordId,
  onClose,
}: ApprovalHistoryModalProps) {
  const [entries, setEntries] = useState<ApprovalHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    getApprovalHistoryAction(recordType, recordId).then((result) => {
      if (active) {
        setEntries(result);
        setIsLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [recordType, recordId]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <DialogTitle>{translations.titles.approvalHistoryTitle}</DialogTitle>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="text-muted-foreground py-6 text-center text-sm">
            {translations.status.loading}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-muted-foreground py-6 text-center text-sm">
            {translations.messages.noApprovalHistory}
          </div>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => {
              const { Icon, className } = ACTION_ICON[entry.action];
              return (
                <li key={entry.id} className="flex items-start gap-3">
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${className}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-medium">
                        {ACTION_LABEL[entry.action]}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {entry.treasurerEmail}
                      </span>
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {new Date(entry.createdAt).toLocaleString("es-CO")}
                    </div>
                    {entry.note && (
                      <p className="mt-1 text-sm">{entry.note}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
