import { getLotsData, getContributions, getExpenses } from "@/lib/data";
import { calculateBalance } from "@/lib/utils";
import NavigationClient from "@/components/shared/NavigationClient";
import FinancialCard from "@/components/shared/FinancialCard";
import QuickStats from "@/components/shared/QuickStats";
import { translations } from "@/lib/translations";

export default async function HomePage() {
  try {
    const [lots, contributions, expenses] = await Promise.all([
      getLotsData(),
      getContributions(),
      getExpenses(),
    ]);

    const maintenanceBalance = calculateBalance(
      "maintenance",
      contributions,
      expenses
    );
    const worksBalance = calculateBalance("works", contributions, expenses);

    return (
      <>
        <NavigationClient lots={lots} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FinancialCard
                title={translations.financial.maintenanceFund}
                balance={maintenanceBalance}
                color="blue"
              />
              <FinancialCard
                title={translations.financial.worksFund}
                balance={worksBalance}
                color="orange"
              />
            </div>

            {/* Quick Stats */}
            <QuickStats
              lots={lots}
              contributions={contributions}
              expenses={expenses}
            />
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error("Error loading data:", error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {translations.app.title}
          </h1>
          <p className="text-gray-600">
            {translations.errors.errorLoadingData}
          </p>
          <p className="text-sm text-red-600 mt-2">
            {error instanceof Error
              ? error.message
              : translations.errors.unknownError}
          </p>
        </div>
      </div>
    );
  }
}
