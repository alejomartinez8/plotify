import { getLots } from "@/lib/database/lots";
import LotList from "@/components/shared/LotList";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";

export default async function LotsPage() {
  try {
    const lots = await getLots();

    return <LotList lots={lots} />;
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
