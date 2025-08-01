import { getAllFundsBalances, getContributions } from "@/lib/database/contributions";
import { getLots } from "@/lib/database/lots";
import { isAuthenticated } from "@/lib/auth";
import FundsOverview from "@/components/shared/FundsOverview";
import LotsTable from "@/components/shared/LotsTable";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";

export default async function Home() {
  try {
    const [fundsData, lots, contributions, isAdmin] = await Promise.all([
      getAllFundsBalances(),
      getLots(),
      getContributions(),
      isAuthenticated(),
    ]);

    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Funds Overview */}
          <FundsOverview fundsData={fundsData} />
          
          {/* Lots Table */}
          <LotsTable 
            lots={lots}
            contributions={contributions}
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
