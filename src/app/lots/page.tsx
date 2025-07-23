import { getLots } from "@/lib/database/lots";
import LotList from "@/components/shared/LotList";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";
import { isAuthenticated } from "@/lib/auth";

export default async function LotsPage() {
  try {
    const [lots, isAdmin] = await Promise.all([
      getLots(),
      isAuthenticated(),
    ]);

    return <LotList lots={lots} isAuthenticated={isAdmin} />;
  } catch (error) {
    console.error("Error loading data:", error);
    return (
      <ErrorLayout
        title={translations.navigation.lots}
        message={translations.errors.loadingLots}
        error={
          error instanceof Error ? error.message : translations.errors.unknown
        }
      />
    );
  }
}
