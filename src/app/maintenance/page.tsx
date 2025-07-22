import { getLots } from "@/lib/database/lots";
import { getContributions } from "@/lib/database/contributions";
import { getAllQuotas } from "@/lib/database/quotas";

import MaintenanceView from "@/components/maintenance/MaintenanceView";
import { translations } from "@/lib/translations";

export default async function MaintenancePage() {
  try {
    const [lots, contributions, quotas] = await Promise.all([
      getLots(),
      getContributions(),
      getAllQuotas(),
    ]);

    return (
      <MaintenanceView
        title={translations.grid.maintenanceContributions}
        lots={lots}
        contributions={contributions}
        quotas={quotas}
      />
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
