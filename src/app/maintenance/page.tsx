import { getLots } from "@/lib/database/lots";
import { getContributions } from "@/lib/database/contributions";

import PaymentGrid from "@/components/shared/PaymentGrid";
import NavigationClient from "@/components/shared/NavigationClient";
import { translations } from "@/lib/translations";

export default async function MaintenancePage() {
  try {
    const [lots, contributions] = await Promise.all([
      getLots(),
      getContributions(),
    ]);

    return (
      <>
        <NavigationClient lots={lots} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PaymentGrid
            title={translations.grid.maintenanceContributions}
            lots={lots}
            contributions={contributions}
            type="maintenance"
            headerColor="bg-yellow-400"
            cellColor="bg-blue-100"
          />
        </div>
      </>
    );
  } catch (error) {
    console.error("Error loading data:", error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {translations.navigation.maintenance}
          </h1>
          <p className="text-gray-600">
            {translations.errors.errorLoadingMaintenance}
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
