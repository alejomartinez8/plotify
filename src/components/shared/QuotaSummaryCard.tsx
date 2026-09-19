import Link from "next/link";
import { SimpleLotBalance } from "@/types/quotas.types";
import { ContributionType } from "@/types/contributions.types";
import { translations } from "@/lib/translations";
import { formatCurrency } from "@/lib/utils";
import TypeBadge from "@/components/shared/TypeBadge";

interface QuotaSummaryCardProps {
  lotBalances: SimpleLotBalance[];
}

const DEBT_CATEGORIES: ContributionType[] = ["maintenance", "works", "others"];

export default function QuotaSummaryCard({
  lotBalances,
}: QuotaSummaryCardProps) {
  const debtByCategory = DEBT_CATEGORIES.map((category) => ({
    category,
    amount: lotBalances.reduce(
      (sum, lot) => sum + lot.debtByCategory[category],
      0
    ),
  }));

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            {translations.titles.quotaSummary}
          </h2>
          <Link
            href="/quotas"
            className="text-sm text-blue-600 hover:text-blue-900"
          >
            {translations.titles.viewQuotas} →
          </Link>
        </div>
      </div>
      <div className="px-6 py-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {lotBalances.length}
            </div>
            <div className="text-sm text-gray-600">
              {translations.labels.totalLots}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(
                lotBalances.reduce(
                  (sum, lot) => sum + lot.outstandingBalance,
                  0
                )
              )}
            </div>
            <div className="text-sm text-gray-600">
              {translations.labels.totalDebt}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {lotBalances.filter((lot) => lot.status === "overdue").length}
            </div>
            <div className="text-sm text-gray-600">
              {translations.labels.overdue}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {lotBalances.filter((lot) => lot.status === "current").length}
            </div>
            <div className="text-sm text-gray-600">
              {translations.labels.current}
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-gray-200 pt-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            {translations.labels.breakdownOf} {translations.labels.totalDebt}:
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {debtByCategory.map(({ category, amount }) => (
              <div
                key={category}
                data-testid={`debt-by-category-${category}`}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2"
              >
                <TypeBadge type={category} />
                <span className="text-sm font-semibold text-red-600">
                  {formatCurrency(amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
