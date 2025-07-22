import { getLots } from "@/lib/database/lots";
import { getContributions } from "@/lib/database/contributions";
import { getAllQuotas } from "@/lib/database/quotas";

import IncomeList from "@/components/shared/IncomeList";
import { translations } from "@/lib/translations";

export default async function IncomePage() {
  try {
    const [lots, contributions, quotas] = await Promise.all([
      getLots(),
      getContributions(),
      getAllQuotas(),
    ]);

    return (
      <IncomeList
        title={translations.navigation.income}
        lots={lots}
        contributions={contributions}
        quotas={quotas}
      />
    );
  } catch (error) {
    console.error("Error loading data:", error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {translations.navigation.income}
          </h1>
          <p className="text-gray-600">
            {translations.errors.loadingIncome}
          </p>
          <p className="text-sm text-red-600 mt-2">
            {error instanceof Error
              ? error.message
              : translations.errors.unknown}
          </p>
        </div>
      </div>
    );
  }
}