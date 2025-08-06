import { getAllFundsBalances, getContributions } from "@/lib/database/contributions";
import { getLots } from "@/lib/database/lots";
import { calculateSimpleLotBalances } from "@/lib/services/simple-quota-service";
import { isAuthenticated } from "@/lib/auth";
import FundsOverview from "@/components/shared/FundsOverview";
import LotCards from "@/components/shared/LotCards";
import QuotaSummaryCard from "@/components/shared/QuotaSummaryCard";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";

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
      <div className="w-full mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        <div className="space-y-8">
          {/* Funds Overview */}
          <FundsOverview fundsData={fundsData} />
          
          {/* Quota Summary Card */}
          <QuotaSummaryCard lotBalances={lotBalances} />
          
          {/* Lots Cards */}
          <LotCards 
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
