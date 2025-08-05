import Link from "next/link";
import { SimpleLotBalance } from "@/lib/services/simple-quota-service";
import { translations } from "@/lib/translations";

interface QuotaSummaryCardProps {
  lotBalances: SimpleLotBalance[];
}

export default function QuotaSummaryCard({ lotBalances }: QuotaSummaryCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
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
            <div className="text-sm text-gray-600">{translations.labels.totalLots}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(lotBalances.reduce((sum, lot) => sum + lot.outstandingBalance, 0))}
            </div>
            <div className="text-sm text-gray-600">{translations.labels.totalDebt}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {lotBalances.filter(lot => lot.status === 'overdue').length}
            </div>
            <div className="text-sm text-gray-600">{translations.labels.overdue}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {lotBalances.filter(lot => lot.status === 'current').length}
            </div>
            <div className="text-sm text-gray-600">{translations.labels.current}</div>
          </div>
        </div>
      </div>
    </div>
  );
}