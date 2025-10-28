import SummaryCard from "@/components/shared/SummaryCard";
import { translations } from "@/lib/translations";
import { ContributionType } from "@/types/contributions.types";

interface SummaryItem {
  type: ContributionType;
  total: number;
  show: boolean;
}

interface SummarySectionProps {
  items: SummaryItem[];
  isExpense?: boolean;
}

export default function SummarySection({
  items,
  isExpense = false,
}: SummarySectionProps) {
  // Only render if there are items to show
  const visibleItems = items.filter((item) => item.show && item.total > 0);

  if (visibleItems.length === 0) return null;

  const getTextColor = (type: ContributionType) => {
    if (isExpense) {
      return "text-destructive";
    }
    return "text-emerald-600";
  };

  const getTitle = (type: ContributionType) => {
    switch (type) {
      case "maintenance":
        return translations.labels.maintenance;
      case "works":
        return translations.labels.works;
      case "others":
        return translations.labels.others;
      default:
        return type;
    }
  };

  return (
    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {visibleItems.map((item) => (
        <SummaryCard
          key={item.type}
          title={getTitle(item.type)}
          total={item.total}
          type={item.type}
          textColorClass={getTextColor(item.type)}
        />
      ))}
    </div>
  );
}
