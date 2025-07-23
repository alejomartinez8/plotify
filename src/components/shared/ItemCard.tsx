import { Edit, Trash2, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { translations } from "@/lib/translations";

interface ItemCardProps {
  id: string | number;
  date: string | Date;
  title: string;
  type: "maintenance" | "works";
  amount: number;
  description?: string;
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
  amountColorClass = "text-emerald-600",
  isAuthenticated = false,
  onEdit,
  onDelete,
  editTitle,
  deleteTitle,
}: ItemCardProps) {
  const formatDate = (dateInput: string | Date) => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTypeColor = (type: string) => {
    return type === "maintenance" 
      ? "bg-blue-50 text-blue-700 border-blue-200" 
      : "bg-amber-50 text-amber-700 border-amber-200";
  };

  const getTypeIcon = (type: string) => {
    return type === "maintenance" ? "🔧" : "🏗️";
  };

  return (
    <div className="group relative bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl p-5 transition-all duration-200 hover:shadow-md">
      {/* Header Row - Date and Actions */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar className="h-4 w-4" />
          <time className="text-sm font-medium">
            {formatDate(date)}
          </time>
        </div>
        
        {isAuthenticated && (onEdit || onDelete) && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

      {/* Main Content */}
      <div className="space-y-2">
        {/* Title */}
        <h3 className="font-medium text-gray-900 text-sm leading-tight">
          {title}
        </h3>

        {/* Type Badge and Amount Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-gray-400" />
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(type)}`}>
              <span className="text-xs">{getTypeIcon(type)}</span>
              {type === "maintenance" ? translations.labels.maintenance : translations.labels.works}
            </span>
          </div>
          
          <div className={`text-sm font-semibold ${amountColorClass}`}>
            {formatCurrency(amount)}
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-gray-600 text-sm leading-relaxed">
              {description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}