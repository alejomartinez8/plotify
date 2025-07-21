import { getLots } from "@/lib/database/lots";
import { getContributions } from "@/lib/database/contributions";
import ContributionViews from "@/components/shared/ContributionViews";
import { translations } from "@/lib/translations";

export default async function WorksPage() {
  try {
    const [lots, contributions] = await Promise.all([
      getLots(),
      getContributions(),
    ]);

    return (
      <ContributionViews
        title={translations.grid.worksContributions}
        lots={lots}
        contributions={contributions}
        type="works"
        headerColor="bg-orange-400"
        cellColor="bg-orange-100"
        listColor="orange"
      />
    );
  } catch (error) {
    console.error("Error loading data:", error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {translations.navigation.works}
          </h1>
          <p className="text-gray-600">
            {translations.errors.errorLoadingWorks}
          </p>
          <p className="text-sm text-red-600 mt-2">
            {error instanceof Error
              ? error.message
              : translations.errors.unknownError}
          </p>
        </div>
      </div>
    );
  }
}
