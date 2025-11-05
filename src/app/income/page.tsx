import { redirect } from "next/navigation";
import { getLots } from "@/lib/database/lots";
import { getContributions } from "@/lib/database/contributions";
import IncomeView from "@/components/shared/IncomeView";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";
import { getUserRole } from "@/lib/auth";

interface IncomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function IncomePage({ searchParams }: IncomePageProps) {
  const resolvedSearchParams = await searchParams;

  const lotParam = resolvedSearchParams.lot;
  if (lotParam && typeof lotParam === "string") {
    const lots = await getLots();
    const lotExists = lots.some((lot) => lot.id === lotParam);
    if (lotExists) {
      redirect(`/income/${lotParam}`);
    }
  }
  try {
    const [allLots, contributions, userRole] = await Promise.all([
      getLots(),
      getContributions(),
      getUserRole(),
    ]);

    return (
      <IncomeView
        lots={allLots}
        contributions={contributions}
        isAdmin={userRole === "admin"}
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
