import { getLots } from "@/lib/database/lots";
import { getContributions } from "@/lib/database/contributions";
import IncomeView from "@/components/shared/IncomeView";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";
import { isAuthenticated } from "@/lib/auth";

export default async function IncomePage() {
  try {
    const [lots, contributions, isAdmin] = await Promise.all([
      getLots(),
      getContributions(),
      isAuthenticated(),
    ]);

    return (
      <IncomeView
        lots={lots}
        contributions={contributions}
        isAuthenticated={isAdmin}
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
