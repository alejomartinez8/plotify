import { formatCurrency, cn } from "@/lib/utils";
import { FundBalance } from "@/types/common.types";
import { translations } from "@/lib/translations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FinancialCardProps {
  title: string;
  balance: FundBalance;
  variant: "default" | "secondary";
}

export default async function FinancialCard({
  title,
  balance,
  variant = "default",
}: FinancialCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">
            {translations.labels.income}:
          </span>
          <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
            {formatCurrency(balance.income)}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">
            {translations.labels.expenses}:
          </span>
          <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/10">
            {formatCurrency(balance.expenses)}
          </Badge>
        </div>
        <div className="border-t pt-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold">
              {translations.labels.balance}:
            </span>
            <Badge 
              variant={balance.balance >= 0 ? "default" : "destructive"}
              className={cn(
                "font-bold",
                balance.balance >= 0 && "bg-emerald-600 hover:bg-emerald-700"
              )}
            >
              {formatCurrency(balance.balance)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
