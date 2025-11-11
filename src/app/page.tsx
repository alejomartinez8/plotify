import { getContributions } from "@/lib/database/contributions";
import { getAllFundsBalances } from "@/lib/database/balances";
import { getLots } from "@/lib/database/lots";
import { getQuotaConfigs } from "@/lib/database/quotas";
import { calculateSimpleLotBalances } from "@/lib/utils";
import { getUserRole } from "@/lib/auth";
import { checkLotAccess } from "@/lib/check-lot-access";
import FundsOverview from "@/components/shared/FundsOverview";
import LotCards from "@/components/shared/LotCards";
import QuotaSummaryCard from "@/components/shared/QuotaSummaryCard";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";

export default async function Home() {
  // Check if user has lot access before loading any data
  await checkLotAccess();

  try {
    const [fundsData, allLots, contributions, quotaConfigs, userRole] =
      await Promise.all([
        getAllFundsBalances(),
        getLots(),
        getContributions(),
        getQuotaConfigs(),
        getUserRole(),
      ]);

    const lotBalances = calculateSimpleLotBalances(
      allLots,
      contributions,
      quotaConfigs
    );

    return (
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        <div className="space-y-8">
          <FundsOverview fundsData={fundsData} />
          <QuotaSummaryCard lotBalances={lotBalances} />
          <LotCards
            lots={allLots}
            contributions={contributions}
            lotBalances={lotBalances}
            isAdmin={userRole === "admin"}
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
