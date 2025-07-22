import { getLots } from "@/lib/database/lots";
import { getContributions } from "@/lib/database/contributions";
import IncomeList from "@/components/shared/IncomeList";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";

export default async function IncomePage() {
  try {
    const [lots, contributions] = await Promise.all([
      getLots(),
      getContributions(),
    ]);

    return (
      <IncomeList
        title={translations.navigation.income}
        lots={lots}
        contributions={contributions}
      />
    );
  } catch (error) {
    console.error("Error loading data:", error);
    return (
      <ErrorLayout
        title={translations.navigation.income}
        message={translations.errors.loadingIncome}
        error={
          error instanceof Error ? error.message : translations.errors.unknown
        }
      />
    );
  }
}
