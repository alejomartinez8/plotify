import { redirect } from "next/navigation";
import { getLots } from "@/lib/database/lots";
import { getContributions } from "@/lib/database/contributions";
import IncomeView from "@/components/shared/IncomeView";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";
import { getUserRole, getVisibleLotIds } from "@/lib/auth";
import { checkLotAccess } from "@/lib/check-lot-access";
import {
  filterVisibleContributions,
  filterVisibleLots,
  isLotVisible,
} from "@/lib/data-visibility";

interface IncomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function IncomePage({ searchParams }: IncomePageProps) {
  await checkLotAccess();

  const resolvedSearchParams = await searchParams;
  const visibleLotIds = await getVisibleLotIds();

  const lotParam = resolvedSearchParams.lot;
  if (
    lotParam &&
    typeof lotParam === "string" &&
    isLotVisible(lotParam, visibleLotIds)
  ) {
    const lots = await getLots();
    const lotExists = lots.some((lot) => lot.id === lotParam);
    if (lotExists) {
      redirect(`/income/${lotParam}`);
    }
  }

  // Owners with a single lot go straight to its detail page
  if (visibleLotIds !== null && visibleLotIds.length === 1) {
    redirect(`/income/${visibleLotIds[0]}`);
  }
  let allLots: Awaited<ReturnType<typeof getLots>>;
  let contributions: Awaited<ReturnType<typeof getContributions>>;
  let userRole: Awaited<ReturnType<typeof getUserRole>>;

  try {
    [allLots, contributions, userRole] = await Promise.all([
      getLots(),
      getContributions(),
      getUserRole(),
    ]);
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

  return (
    <IncomeView
      lots={filterVisibleLots(allLots, visibleLotIds)}
      contributions={filterVisibleContributions(contributions, visibleLotIds)}
      isAdmin={userRole === "admin"}
      isTreasurer={userRole === "treasurer"}
    />
  );
}
