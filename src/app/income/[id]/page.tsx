import { notFound } from "next/navigation";
import { getLotWithContributions, getLots } from "@/lib/database/lots";
import { getQuotaConfigs } from "@/lib/database/quotas";
import { translations } from "@/lib/translations";
import { isAuthenticated } from "@/lib/auth";
import { Contribution, ContributionType } from "@/types/contributions.types";
import { calculateLotDebtDetail } from "@/lib/utils";
import LotDetailView from "@/components/shared/LotDetailView";

interface LotPageProps {
  params: Promise<{ id: string }>;
}

export default async function LotPage({ params }: LotPageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // Fetch lot data with contributions, debt details, and all lots for the selector
  const [lotData, allLots, quotaConfigs, isAdmin] = await Promise.all([
    getLotWithContributions(id),
    getLots(),
    getQuotaConfigs(),
    isAuthenticated(),
  ]);

  const debtDetail = calculateLotDebtDetail(lotData, quotaConfigs);

  if (!lotData) {
    notFound();
  }

  // Transform the data to match our TypeScript interfaces
  const lot = {
    ...lotData,
    contributions: lotData.contributions.map((contrib) => ({
      ...contrib,
      type: contrib.type as ContributionType,
      date: contrib.date.toISOString().split("T")[0], // Convert Date to YYYY-MM-DD string
    })) as Contribution[],
  };

  return (
    <LotDetailView
      lot={lot}
      contributions={lot.contributions}
      allLots={allLots}
      isAuthenticated={isAdmin}
      debtDetail={debtDetail}
    />
  );
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
