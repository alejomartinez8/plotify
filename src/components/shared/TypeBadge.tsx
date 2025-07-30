import { ContributionType } from "@/types/contributions.types";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface TypeBadgeProps {
  type: ContributionType;
  className?: string;
}

export default function TypeBadge({ type, className }: TypeBadgeProps) {
  const getTypeIcon = (type: ContributionType) => {
    switch (type) {
      case 'maintenance':
        return '🔧';
      case 'works':
        return '🏗️';
      case 'others':
        return '⚡';
      default:
        return '📄';
    }
  };

  const getTypeLabel = (type: ContributionType) => {
    switch (type) {
      case 'maintenance':
        return 'Mant.';
      case 'works':
        return 'Obras';
      case 'others':
        return 'Otros';
      default:
        return type;
    }
  };

  const getTypeBadgeClasses = (type: ContributionType) => {
    switch (type) {
      case 'maintenance':
        return 'bg-blue-50 text-blue-700 border-blue-200 rounded-full';
      case 'works':
        return 'bg-amber-50 text-amber-700 border-amber-200 rounded-full';
      case 'others':
        return 'bg-purple-50 text-purple-700 border-purple-200 rounded-full';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 rounded-full';
    }
  };

  return (
    <Badge 
      variant="outline"
      className={cn(getTypeBadgeClasses(type), className)}
    >
      <span className="text-xs">{getTypeIcon(type)}</span>
      {getTypeLabel(type)}
    </Badge>
  );
}