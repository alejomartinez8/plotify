import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { translations } from "@/lib/translations";

interface SummaryCardProps {
  title: string;
  total: number;
  textColorClass?: string;
}

export default function SummaryCard({
  title,
  total,
  textColorClass = "text-primary",
}: SummaryCardProps) {
  const getTypeIcon = (title: string) => {
    if (title === translations.labels.maintenance) {
      return "🔧";
    } else if (title === translations.labels.works) {
      return "🏗️";
    }
    return "💰"; // default for other summaries
  };

  const getBadgeClasses = (colorClass: string) => {
    if (colorClass.includes("primary")) {
      return "bg-blue-600 hover:bg-blue-700";
    } else if (colorClass.includes("secondary")) {
      return "bg-slate-600 hover:bg-slate-700";
    } else if (colorClass.includes("emerald")) {
      return "bg-emerald-600 hover:bg-emerald-700";
    } else if (colorClass.includes("destructive")) {
      return "bg-red-600 hover:bg-red-700";
    }
    return "bg-blue-600 hover:bg-blue-700"; // default
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span>{getTypeIcon(title)}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold">
            {translations.labels.total}:
          </span>
          <Badge
            variant="default"
            className={`font-bold ${getBadgeClasses(textColorClass)}`}
          >
            {formatCurrency(total)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}