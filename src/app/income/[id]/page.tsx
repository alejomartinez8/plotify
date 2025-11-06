import { notFound } from "next/navigation";
import { getLotWithContributions, getLots } from "@/lib/database/lots";
import { getQuotaConfigs } from "@/lib/database/quotas";
import { translations } from "@/lib/translations";
import { getUserRole } from "@/lib/auth";
import { checkLotAccess } from "@/lib/check-lot-access";
import { Contribution, ContributionType } from "@/types/contributions.types";
import { calculateLotDebtDetail } from "@/lib/utils";
import LotDetailView from "@/components/shared/LotDetailView";
import ErrorLayout from "@/components/layout/ErrorLayout";

interface LotPageProps {
  params: Promise<{ id: string }>;
}

export default async function LotPage({ params }: LotPageProps) {
  await checkLotAccess();

  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const [lotData, allLotsData, quotaConfigs, userRole] = await Promise.all([
      getLotWithContributions(id),
      getLots(),
      getQuotaConfigs(),
      getUserRole(),
    ]);

    const debtDetail = calculateLotDebtDetail(lotData, quotaConfigs);

    if (!lotData) {
      notFound();
    }

    const lot = {
      ...lotData,
      contributions: lotData.contributions.map((contrib) => ({
        ...contrib,
        type: contrib.type as ContributionType,
        date: contrib.date.toISOString().split("T")[0],
      })) as Contribution[],
    };

    return (
      <LotDetailView
        lot={lot}
        contributions={lot.contributions}
        allLots={allLotsData}
        isAdmin={userRole === "admin"}
        debtDetail={debtDetail}
      />
    );
  } catch (error) {
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

// Generate metadata for the page
export async function generateMetadata({ params }: LotPageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const lot = await getLotWithContributions(id);

  if (!lot) {
    return {
      title: "Lote no encontrado",
    };
  }

  return {
    title: `Lote ${lot.lotNumber} - ${lot.owner} | ${translations.app.title}`,
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
      nocache: true,
    },
  };
}
