import { Edit, Trash2, Calendar, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateForDisplay } from "@/lib/utils";
import { translations } from "@/lib/translations";
import { ContributionType } from "@/types/contributions.types";

interface ItemCardProps {
  id: string | number;
  date: string | Date;
  title: string;
  type: ContributionType;
  amount: number;
  description?: string;
  receiptNumber?: string | null;
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
  amountColorClass = "text-emerald-600",
  isAuthenticated = false,
  onEdit,
  onDelete,
  editTitle,
  deleteTitle,
}: ItemCardProps) {

  const getTypeColor = (type: ContributionType) => {
    switch (type) {
      case "maintenance":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "works":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "others":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getTypeIcon = (type: ContributionType) => {
    switch (type) {
      case "maintenance":
        return "🔧";
      case "works":
        return "🏗️";
      case "others":
        return "⚡";
      default:
        return "📄";
    }
  };

  return (
    <div className="group relative bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl p-5 transition-all duration-200 hover:shadow-md">
      {/* Type Badge - Top Right Corner */}
      <div className="absolute top-3 right-3">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(type)}`}>
          <span className="text-xs">{getTypeIcon(type)}</span>
          {type === "maintenance" ? translations.labels.maintenance : 
           type === "works" ? translations.labels.works : 
           translations.labels.others}
        </span>
      </div>

      {/* Header Row - Date */}
      <div className="mb-3 pr-20">
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
        <h3 className="font-medium text-gray-900 text-sm leading-tight pr-16">
          {title}
        </h3>

        {/* Amount */}
        <div className={`text-sm font-semibold ${amountColorClass}`}>
          {formatCurrency(amount)}
        </div>

        {/* Description and Receipt Number */}
        {(description || receiptNumber) && (
          <div className="pt-2 border-t border-gray-100 space-y-1">
            {description && (
              <p className="text-gray-600 text-sm leading-relaxed">
                {description}
              </p>
            )}
            {receiptNumber && (
              <div className="flex items-center gap-1.5">
                <Receipt className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs text-gray-500 font-medium">
                  {translations.labels.receiptNumber}: {receiptNumber}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons - Bottom Right Corner */}
      {isAuthenticated && (onEdit || onDelete) && (
        <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
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
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
              title={deleteTitle || translations.actions.delete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}