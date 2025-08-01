import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { translations } from "@/lib/translations";
import TypeBadge from "@/components/shared/TypeBadge";
import { ContributionType } from "@/types/contributions.types";

interface SummaryCardProps {
  title: string;
  total: number;
  type?: ContributionType;
  textColorClass?: string;
}

export default function SummaryCard({
  title,
  total,
  type,
  textColorClass = "text-emerald-600",
}: SummaryCardProps) {
  const getTypeIcon = (title: string) => {
    if (title === translations.labels.maintenance) {
      return "🔧";
    } else if (title === translations.labels.works) {
      return "🏗️";
    } else if (title === translations.labels.others) {
      return "📋";
    }
    return "💰"; // default for other summaries
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {type ? (
          <TypeBadge type={type} />
        ) : (
          <div className="h-4 w-4 text-muted-foreground">{getTypeIcon(title)}</div>
        )}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${textColorClass}`}>
          {formatCurrency(total)}
        </div>
      </CardContent>
    </Card>
  );
}