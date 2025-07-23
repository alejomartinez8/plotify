import { Card, CardContent } from "@/components/ui/card";
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
  const getGradientClass = (colorClass: string) => {
    if (colorClass.includes("primary")) {
      return "from-blue-500 to-blue-600";
    } else if (colorClass.includes("secondary")) {
      return "from-slate-500 to-slate-600";
    } else if (colorClass.includes("emerald")) {
      return "from-emerald-500 to-emerald-600";
    } else if (colorClass.includes("destructive")) {
      return "from-red-500 to-red-600";
    }
    return "from-blue-500 to-blue-600"; // default
  };

  const getIconBgClass = (colorClass: string) => {
    if (colorClass.includes("primary")) {
      return "bg-blue-100 text-blue-600";
    } else if (colorClass.includes("secondary")) {
      return "bg-slate-100 text-slate-600";
    } else if (colorClass.includes("emerald")) {
      return "bg-emerald-100 text-emerald-600";
    } else if (colorClass.includes("destructive")) {
      return "bg-red-100 text-red-600";
    }
    return "bg-blue-100 text-blue-600"; // default
  };

  const getTypeIcon = (title: string) => {
    if (title === translations.labels.maintenance) {
      return "🔧";
    } else if (title === translations.labels.works) {
      return "🏗️";
    }
    return "💰"; // default for other summaries
  };

  return (
    <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getGradientClass(textColorClass)} opacity-5`} />
      
      <CardContent className="relative p-4">
        <div className="flex items-center justify-between mb-3">
          <div className={`rounded-full p-2 ${getIconBgClass(textColorClass)} text-lg`}>
            {getTypeIcon(title)}
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
            {title}
          </p>
          <p className={`text-lg font-bold ${textColorClass}`}>
            {formatCurrency(total)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}