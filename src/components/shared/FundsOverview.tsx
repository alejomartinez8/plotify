import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { translations } from "@/lib/translations";
import { formatCurrency } from "@/lib/utils";
import TypeBadge from "@/components/shared/TypeBadge";
import { ContributionType } from "@/types/contributions.types";

interface FundBalance {
  income: number;
  expenses: number;
  balance: number;
}

interface FundsOverviewProps {
  fundsData: {
    maintenance: FundBalance;
    works: FundBalance;
    others: FundBalance;
    consolidated: FundBalance;
  };
}

export default function FundsOverview({ fundsData }: FundsOverviewProps) {
  const incomeCategories = [
    {
      key: "maintenance" as ContributionType,
      title: translations.labels.maintenance,
      amount: fundsData.maintenance.income,
    },
    {
      key: "works" as ContributionType,  
      title: translations.labels.works,
      amount: fundsData.works.income,
    },
    {
      key: "others" as ContributionType,
      title: translations.labels.others,
      amount: fundsData.others.income,
    },
  ];

  const getBalanceColorClass = (balance: number) => {
    if (balance > 0) return "text-green-600";
    if (balance < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-6">
      {/* Single Consolidated Financial Summary Card */}
      <Card className="bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-800">
              {translations.titles.financialSummary}
            </CardTitle>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
              <span className="text-xs">📊</span>
              {translations.labels.consolidated}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/income" className="block">
              <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-200 cursor-pointer hover:shadow-md">
                <div className="text-sm text-emerald-700 mb-2 font-medium">
                  {translations.labels.income}
                </div>
                <div className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(fundsData.consolidated.income)}
                </div>
                <div className="text-xs text-emerald-600 mt-1 opacity-70">
                  {translations.labels.clickForDetails}
                </div>
              </div>
            </Link>
            <Link href="/expenses" className="block">
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all duration-200 cursor-pointer hover:shadow-md">
                <div className="text-sm text-red-700 mb-2 font-medium">
                  {translations.labels.expenses}
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(fundsData.consolidated.expenses)}
                </div>
                <div className="text-xs text-red-600 mt-1 opacity-70">
                  {translations.labels.clickForDetails}
                </div>
              </div>
            </Link>
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-700 mb-2 font-medium">
                {translations.labels.balance}
              </div>
              <div
                className={`text-2xl font-bold ${getBalanceColorClass(
                  fundsData.consolidated.balance
                )}`}
              >
                {formatCurrency(fundsData.consolidated.balance)}
              </div>
            </div>
          </div>

          {/* Income Breakdown by Categories */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              {translations.labels.breakdownOf} {translations.labels.income}:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {incomeCategories.map((category) => (
                <div key={category.key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <TypeBadge type={category.key} />
                  <span className="font-semibold text-gray-800">
                    {formatCurrency(category.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}