import { redirect } from "next/navigation";
import { getLots } from "@/lib/database/lots";
import { getContributions } from "@/lib/database/contributions";
import IncomeView from "@/components/shared/IncomeView";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";
import { isAuthenticated } from "@/lib/auth";

interface IncomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function IncomePage({ searchParams }: IncomePageProps) {
  const resolvedSearchParams = await searchParams;
  
  // Check if there's a lot parameter - if so, redirect to the lot page for backward compatibility
  const lotParam = resolvedSearchParams.lot;
  if (lotParam && typeof lotParam === 'string') {
    // Verify the lot exists before redirecting
    const lots = await getLots();
    const lotExists = lots.some(lot => lot.id === lotParam);
    if (lotExists) {
      redirect(`/lots/${lotParam}`);
    }
  }
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
