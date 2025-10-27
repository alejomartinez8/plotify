import {
  getAllFundsBalances,
  getContributions,
} from "@/lib/database/contributions";
import { getLots } from "@/lib/database/lots";
import { getQuotaConfigs } from "@/lib/database/quotas";
import { calculateSimpleLotBalances } from "@/lib/utils";
import { isAuthenticated } from "@/lib/auth";
import FundsOverview from "@/components/shared/FundsOverview";
import LotCards from "@/components/shared/LotCards";
import QuotaSummaryCard from "@/components/shared/QuotaSummaryCard";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";

export default async function Home() {
  try {
    const [fundsData, lots, contributions, quotaConfigs, isAdmin] =
      await Promise.all([
        getAllFundsBalances(),
        getLots(),
        getContributions(),
        getQuotaConfigs(),
        isAuthenticated(),
      ]);

    const lotBalances = calculateSimpleLotBalances(
      lots,
      contributions,
      quotaConfigs
    );

    return (
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
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
