import { notFound } from "next/navigation";
import { getLotWithContributions, getLots } from "@/lib/database/lots";
import { translations } from "@/lib/translations";
import { isAuthenticated } from "@/lib/auth";
import { Contribution, ContributionType } from "@/types/contributions.types";
import LotDetailView from "@/components/shared/LotDetailView";

interface LotPageProps {
  params: Promise<{ id: string }>;
}

export default async function LotPage({ params }: LotPageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  // Fetch lot data with contributions and all lots for the selector
  const [lotData, allLots, isAdmin] = await Promise.all([
    getLotWithContributions(id),
    getLots(),
    isAuthenticated(),
  ]);
  
  if (!lotData) {
    notFound();
  }

  // Transform the data to match our TypeScript interfaces
  const lot = {
    ...lotData,
    contributions: lotData.contributions.map(contrib => ({
      ...contrib,
      type: contrib.type as ContributionType,
      date: contrib.date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string
    })) as Contribution[]
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {translations.labels.lot} {lot.lotNumber}
            </h1>
            <p className="text-lg text-muted-foreground mt-1">
              {lot.owner}
            </p>
          </div>
        </div>
      </div>

      {/* Lot Detail Component */}
      <LotDetailView 
        lot={lot}
        contributions={lot.contributions}
        allLots={allLots}
        isAuthenticated={isAdmin}
      />
    </div>
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
    title: `${translations.labels.lot} ${lot.lotNumber} - ${lot.owner} | ${translations.app.title}`,
    description: `Detalles de aportes y pagos del ${translations.labels.lot.toLowerCase()} ${lot.lotNumber} - ${lot.owner}`,
  };
}