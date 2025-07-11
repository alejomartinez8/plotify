import { getLotsData, getContributions, getExpenses } from "@/lib/data";

import PaymentGrid from "@/components/shared/PaymentGrid";
import NavigationClient from "@/components/shared/NavigationClient";

export default async function MaintenancePage() {
  try {
    const [lots, contributions, expenses] = await Promise.all([
      getLotsData(),
      getContributions(),
      getExpenses(),
    ]);

    return (
      <>
        <NavigationClient lots={lots} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PaymentGrid
            title="Maintenance Contributions"
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Maintenance</h1>
          <p className="text-gray-600">Error loading maintenance data</p>
          <p className="text-sm text-red-600 mt-2">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }
}
