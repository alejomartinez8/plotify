import { Edit, Trash2, Calendar, Receipt, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDateForDisplay } from "@/lib/utils";
import { translations } from "@/lib/translations";
import { ContributionType } from "@/types/contributions.types";
import TypeBadge from "@/components/shared/TypeBadge";

interface ItemCardProps {
  id: string | number;
  date: string | Date;
  title: string;
  type: ContributionType;
  amount: number;
  description?: string;
  receiptNumber?: string | null;
  receiptFileUrl?: string | null;
  amountColorClass?: string;
  isAuthenticated?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  editTitle?: string;
  deleteTitle?: string;
}

export default function ItemCard({
  date,
  title,
  type,
  amount,
  description,
  receiptNumber,
  receiptFileUrl,
  amountColorClass = "text-emerald-600",
  isAuthenticated = false,
  onEdit,
  onDelete,
  editTitle,
  deleteTitle,
}: ItemCardProps) {
  const handlePreviewReceipt = () => {
    if (receiptFileUrl) {
      window.open(receiptFileUrl, "_blank");
    }
  };

  return (
    <div className="group relative rounded-xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md">
      {/* Type Badge and Receipt Icon - Top Right Corner */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        {receiptFileUrl && (
          <div
            className="cursor-pointer rounded-lg bg-green-100 p-1.5 transition-colors hover:bg-green-200"
            onClick={handlePreviewReceipt}
            title={translations.actions.viewReceipt}
          >
            <FileText className="h-4 w-4 text-green-600" />
          </div>
        )}
        <TypeBadge type={type} />
      </div>

      {/* Header Row - Date */}
      <div className="mb-3 pr-24">
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar className="h-4 w-4" />
          <time className="text-sm font-medium">
            {formatDateForDisplay(date)}
          </time>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-2">
        {/* Title */}
        <h3 className="pr-20 text-sm leading-tight font-medium text-gray-900">
          {title}
        </h3>

        {/* Amount */}
        <div className={`text-sm font-semibold ${amountColorClass}`}>
          {formatCurrency(amount)}
        </div>

        {/* Description and Receipt Number */}
        {(description || receiptNumber) && (
          <div className="space-y-1 border-t border-gray-100 pt-2">
            {description && (
              <p className="text-sm leading-relaxed text-gray-600">
                {description}
              </p>
            )}
            {receiptNumber && (
              <div className="flex items-center gap-1.5">
                <Receipt className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs font-medium text-gray-500">
                  {translations.labels.receiptNumber}: {receiptNumber}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons - Bottom Right Corner */}
      {(isAuthenticated && (onEdit || onDelete)) || receiptFileUrl ? (
        <div className="absolute right-3 bottom-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {receiptFileUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviewReceipt}
              title={translations.actions.viewReceipt}
              className="h-8 w-8 p-0 hover:bg-green-50"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {isAuthenticated && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              title={editTitle || translations.actions.edit}
              className="h-8 w-8 p-0 hover:bg-blue-50"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {isAuthenticated && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
              title={deleteTitle || translations.actions.delete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
