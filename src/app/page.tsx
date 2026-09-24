import { getContributions } from "@/lib/database/contributions";
import { getAllFundsBalances, getMonthlyTotals } from "@/lib/database/balances";
import { getLots } from "@/lib/database/lots";
import { getQuotaConfigs } from "@/lib/database/quotas";
import { calculateSimpleLotBalances } from "@/lib/utils";
import { getUserRole, getVisibleLotIds } from "@/lib/auth";
import { checkLotAccess } from "@/lib/check-lot-access";
import {
  filterVisibleContributions,
  filterVisibleLots,
  hasFullDataAccess,
} from "@/lib/data-visibility";
import FundsOverview from "@/components/shared/FundsOverview";
import LotCards from "@/components/shared/LotCards";
import QuotaSummaryCard from "@/components/shared/QuotaSummaryCard";
import WhatsAppReportButton from "@/components/shared/WhatsAppReportButton";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";

export default async function Home() {
  // Check if user has lot access before loading any data
  await checkLotAccess();

  const userRole = await getUserRole();
  // Owners only see their own lots; community-wide figures are shared
  // with them outside the app (WhatsApp)
  const showCommunityData = hasFullDataAccess(userRole);

  let fundsData: Awaited<ReturnType<typeof getAllFundsBalances>> | null;
  let allLots: Awaited<ReturnType<typeof getLots>>;
  let contributions: Awaited<ReturnType<typeof getContributions>>;
  let quotaConfigs: Awaited<ReturnType<typeof getQuotaConfigs>>;
  let monthlyData: Awaited<ReturnType<typeof getMonthlyTotals>> | null;
  let visibleLotIds: string[] | null;

  try {
    [
      fundsData,
      allLots,
      contributions,
      quotaConfigs,
      monthlyData,
      visibleLotIds,
    ] = await Promise.all([
      showCommunityData ? getAllFundsBalances() : null,
      getLots(),
      getContributions(),
      getQuotaConfigs(),
      showCommunityData ? getMonthlyTotals() : null,
      getVisibleLotIds(),
    ]);
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

  const visibleLots = filterVisibleLots(allLots, visibleLotIds);
  const visibleContributions = filterVisibleContributions(
    contributions,
    visibleLotIds
  );
  const lotBalances = calculateSimpleLotBalances(
    visibleLots,
    visibleContributions,
    quotaConfigs
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
      <div className="space-y-8">
        {fundsData && monthlyData && (
          <FundsOverview fundsData={fundsData} monthlyData={monthlyData} />
        )}
        <QuotaSummaryCard lotBalances={lotBalances} />
        {userRole === "admin" && fundsData && (
          <div className="flex justify-end">
            <WhatsAppReportButton
              lotBalances={lotBalances}
              consolidatedBalance={fundsData.consolidated.balance}
            />
          </div>
        )}
        <LotCards
          lots={visibleLots}
          contributions={visibleContributions}
          lotBalances={lotBalances}
          isAdmin={userRole === "admin"}
        />
      </div>
    </div>
  );
}
