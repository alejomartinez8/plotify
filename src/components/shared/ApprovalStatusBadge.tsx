import { ApprovalStatus } from "@/types/approvals.types";
import { Badge } from "@/components/ui/Badge";
import { translations } from "@/lib/translations";
import { cn } from "@/lib/utils";

interface ApprovalStatusBadgeProps {
  status: ApprovalStatus;
  className?: string;
}

export default function ApprovalStatusBadge({
  status,
  className,
}: ApprovalStatusBadgeProps) {
  const getStatusIcon = (status: ApprovalStatus) => {
    switch (status) {
      case "approved":
        return "✅";
      case "rejected":
        return "❌";
      default:
        return "⏳";
    }
  };

  const getStatusLabel = (status: ApprovalStatus) => {
    switch (status) {
      case "approved":
        return translations.labels.approved;
      case "rejected":
        return translations.labels.rejected;
      default:
        return translations.labels.pending;
    }
  };

  const getStatusBadgeClasses = (status: ApprovalStatus) => {
    switch (status) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 rounded-full";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200 rounded-full";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200 rounded-full";
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(getStatusBadgeClasses(status), className)}
    >
      <span className="text-xs">{getStatusIcon(status)}</span>
      {getStatusLabel(status)}
    </Badge>
  );
}
