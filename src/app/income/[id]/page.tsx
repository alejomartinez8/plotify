import { notFound } from "next/navigation";
import { getLotWithContributions, getLots } from "@/lib/database/lots";
import { getQuotaConfigs } from "@/lib/database/quotas";
import { translations } from "@/lib/translations";
import { getUserRole, getVisibleLotIds } from "@/lib/auth";
import { filterVisibleLots, isLotVisible } from "@/lib/data-visibility";
import { checkLotAccess } from "@/lib/check-lot-access";
import { calculateLotDebtDetail } from "@/lib/utils";
import LotDetailView from "@/components/shared/LotDetailView";
import ErrorLayout from "@/components/layout/ErrorLayout";

interface LotPageProps {
  params: Promise<{ id: string }>;
}

export default async function LotPage({ params }: LotPageProps) {
  await checkLotAccess();

  const { id } = await params;
  const visibleLotIds = await getVisibleLotIds();

  // Owners can only open their own lots; hide the existence of others
  if (!isLotVisible(id, visibleLotIds)) {
    notFound();
  }

  let lotData: Awaited<ReturnType<typeof getLotWithContributions>>;
  let allLotsData: Awaited<ReturnType<typeof getLots>>;
  let quotaConfigs: Awaited<ReturnType<typeof getQuotaConfigs>>;
  let userRole: Awaited<ReturnType<typeof getUserRole>>;
  let debtDetail: ReturnType<typeof calculateLotDebtDetail>;

  try {
    [lotData, allLotsData, quotaConfigs, userRole] = await Promise.all([
      getLotWithContributions(id),
      getLots(),
      getQuotaConfigs(),
      getUserRole(),
    ]);

    debtDetail = calculateLotDebtDetail(lotData, quotaConfigs);
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

  if (!lotData) {
    notFound();
  }

  const lot = lotData;

  return (
    <LotDetailView
      lot={lot}
      contributions={lot.contributions}
      allLots={filterVisibleLots(allLotsData, visibleLotIds)}
      isAdmin={userRole === "admin"}
      debtDetail={debtDetail}
      quotaConfigs={quotaConfigs}
    />
  );
}

// Generate metadata for the page
export async function generateMetadata({ params }: LotPageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const visibleLotIds = await getVisibleLotIds();
  const lot = isLotVisible(id, visibleLotIds)
    ? await getLotWithContributions(id)
    : null;

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
