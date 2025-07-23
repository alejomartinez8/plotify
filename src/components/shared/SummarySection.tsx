import SummaryCard from "@/components/shared/SummaryCard";
import { translations } from "@/lib/translations";

interface SummaryItem {
  type: "maintenance" | "works";
  total: number;
  show: boolean;
}

interface SummarySectionProps {
  icon: string;
  gradientClasses: string;
  items: SummaryItem[];
}

export default function SummarySection({
  icon,
  gradientClasses,
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
    <div className={`mb-6 rounded-lg border bg-gradient-to-r p-4 ${gradientClasses}`}>
      <h4 className="mb-3 font-semibold">
        {icon} {translations.labels.summary}
      </h4>
      <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((item) => (
          <SummaryCard
            key={item.type}
            title={getTitle(item.type)}
            total={item.total}
            textColorClass={getTextColor(item.type)}
          />
        ))}
      </div>
    </div>
  );
}