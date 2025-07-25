import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { translations } from "@/lib/translations";
import { formatCurrency } from "@/lib/utils";

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
  const funds = [
    {
      key: "maintenance",
      title: translations.titles.maintenanceFund,
      data: fundsData.maintenance,
      icon: "🔧",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      key: "works",  
      title: translations.titles.worksFund,
      data: fundsData.works,
      icon: "🏗️",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      key: "others",
      title: translations.titles.othersFund,
      data: fundsData.others,
      icon: "⚡",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    },
  ];

  const getBalanceColorClass = (balance: number) => {
    if (balance > 0) return "text-green-600";
    if (balance < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-6">
      {/* Individual Funds */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {funds.map((fund) => (
          <Card key={fund.key} className="bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-800">
                  {fund.title}
                </CardTitle>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${fund.badgeColor}`}>
                  <span className="text-xs">{fund.icon}</span>
                  {fund.key === "maintenance" ? "Mant." : fund.key === "works" ? "Obras" : "Otros"}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {translations.labels.income}:
                </span>
                <span className="font-medium">
                  {formatCurrency(fund.data.income)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {translations.labels.expenses}:
                </span>
                <span className="font-medium">
                  {formatCurrency(fund.data.expenses)}
                </span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">
                    {translations.labels.balance}:
                  </span>
                  <span
                    className={`font-bold text-lg ${getBalanceColorClass(
                      fund.data.balance
                    )}`}
                  >
                    {formatCurrency(fund.data.balance)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Consolidated Fund */}
      <Card className="bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-800">
              {translations.titles.consolidatedFund}
            </CardTitle>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-gray-50 text-gray-700 border-gray-200">
              <span className="text-xs">💰</span>
              Total
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">
                {translations.labels.income}
              </div>
              <div className="text-lg font-semibold">
                {formatCurrency(fundsData.consolidated.income)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">
                {translations.labels.expenses}
              </div>
              <div className="text-lg font-semibold">
                {formatCurrency(fundsData.consolidated.expenses)}
              </div>
            </div>
            <div className="text-center md:col-span-1 col-span-2">
              <div className="text-sm text-gray-600 mb-1">
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
        </CardContent>
      </Card>
    </div>
  );
}