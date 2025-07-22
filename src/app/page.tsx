import { getLots } from "@/lib/database/lots";
import { getContributions } from "@/lib/database/contributions";
import { getExpenses } from "@/lib/database/expenses";
import { calculateBalance } from "@/lib/utils";
import FinancialCard from "@/components/shared/FinancialCard";
import QuickStats from "@/components/shared/QuickStats";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";

export default async function Home() {
  try {
    const [lots, contributions, expenses] = await Promise.all([
      getLots(),
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FinancialCard
              title={translations.titles.maintenanceFund}
              balance={maintenanceBalance}
              variant="default"
            />
            <FinancialCard
              title={translations.titles.worksFund}
              balance={worksBalance}
              variant="secondary"
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
    );
  } catch (error) {
    console.error("Error loading data:", error);
    return (
      <ErrorLayout
        title={translations.app.title}
        message={translations.errors.loadingData}
        error={error instanceof Error ? error.message : translations.errors.unknown}
      />
    );
  }
}
