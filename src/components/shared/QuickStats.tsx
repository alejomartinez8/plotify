import { Users, DollarSign, Calendar } from "lucide-react";
import { Lot } from "@/types/lots.types";
import { Contribution } from "@/types/contributions.types";
import { Expense } from "@/types/expenses.types";
import { translations } from "@/lib/translations";

interface QuickStatsProps {
  lots: Lot[];
  contributions: Contribution[];
  expenses: Expense[];
}

export default async function QuickStats({
  lots,
  contributions,
  expenses,
}: QuickStatsProps) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const currentMonthContributions = contributions.filter((c) => {
    const contributionDate = new Date(c.date);
    return (
      contributionDate.getMonth() === currentMonth &&
      contributionDate.getFullYear() === currentYear
    );
  });

  const currentMonthExpenses = expenses.filter((e) => {
    const expenseDate = new Date(e.date);
    return (
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear
    );
  });

  const stats = [
    {
      icon: Users,
      label: translations.titles.totalLots,
      value: lots.length,
      color: "text-blue-600",
    },
    {
      icon: DollarSign,
      label: translations.titles.contributionsThisMonth,
      value: currentMonthContributions.length,
      color: "text-green-600",
    },
    {
      icon: Calendar,
      label: translations.titles.expensesThisMonth,
      value: currentMonthExpenses.length,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {stats.map((stat, index) => (
        <div key={index} className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <stat.icon className={`h-8 w-8 ${stat.color}`} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
