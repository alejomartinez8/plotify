import SummaryCard from "@/components/shared/SummaryCard";
import { translations } from "@/lib/translations";

interface SummaryItem {
  type: "maintenance" | "works";
  total: number;
  show: boolean;
}

interface SummarySectionProps {
  items: SummaryItem[];
}

export default function SummarySection({
  items,
}: SummarySectionProps) {
  // Only render if there are items to show
  const visibleItems = items.filter(item => item.show && item.total > 0);
  
  if (visibleItems.length === 0) return null;

  const getTextColor = (type: string) => {
    switch (type) {
      case "maintenance":
        return "text-primary";
      case "works":
        return "text-secondary-foreground";
      default:
        return "text-primary";
    }
  };

  const getTitle = (type: string) => {
    switch (type) {
      case "maintenance":
        return translations.labels.maintenance;
      case "works":
        return translations.labels.works;
      default:
        return type;
    }
  };

  return (
    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
      {visibleItems.map((item) => (
        <SummaryCard
          key={item.type}
          title={getTitle(item.type)}
          total={item.total}
          textColorClass={getTextColor(item.type)}
        />
      ))}
    </div>
  );
}