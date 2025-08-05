import { getAllFundsBalances, getContributions } from "@/lib/database/contributions";
import { getLots } from "@/lib/database/lots";
import { calculateSimpleLotBalances } from "@/lib/services/simple-quota-service";
import { isAuthenticated } from "@/lib/auth";
import FundsOverview from "@/components/shared/FundsOverview";
import LotsTable from "@/components/shared/LotsTable";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";
import Link from "next/link";

export default async function Home() {
  try {
    const [fundsData, lots, contributions, lotBalances, isAdmin] = await Promise.all([
      getAllFundsBalances(),
      getLots(),
      getContributions(),
      calculateSimpleLotBalances(),
      isAuthenticated(),
    ]);

    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Funds Overview */}
          <FundsOverview fundsData={fundsData} />
          
          {/* Quota Summary Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Resumen de Cuotas
                </h2>
                <Link
                  href="/quotas"
                  className="text-sm text-blue-600 hover:text-blue-900"
                >
                  Ver cuotas →
                </Link>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {lotBalances.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Lotes</div>
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
                  <div className="text-sm text-gray-600">Deuda Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {lotBalances.filter(lot => lot.status === 'overdue').length}
                  </div>
                  <div className="text-sm text-gray-600">Atrasados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {lotBalances.filter(lot => lot.status === 'current').length}
                  </div>
                  <div className="text-sm text-gray-600">Al Día</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Lots Table */}
          <LotsTable 
            lots={lots}
            contributions={contributions}
            lotBalances={lotBalances}
            isAuthenticated={isAdmin}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading data:", error);
    return (
      <ErrorLayout
        title={translations.app.title}
        message={translations.errors.loadingData}
        error={
          error instanceof Error ? error.message : translations.errors.unknown
        }
      />
    );
  }
}
