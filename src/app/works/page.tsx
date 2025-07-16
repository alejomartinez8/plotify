import { getLotsData, getContributions } from "@/lib/data";
import PaymentGrid from "@/components/shared/PaymentGrid";
import NavigationClient from "@/components/shared/NavigationClient";

export default async function WorksPage() {
  try {
    const [lots, contributions] = await Promise.all([
      getLotsData(),
      getContributions(),
    ]);

    return (
      <>
        <NavigationClient lots={lots} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PaymentGrid
            title="Works Contributions"
            lots={lots}
            contributions={contributions}
            type="works"
            headerColor="bg-orange-400"
            cellColor="bg-orange-100"
          />
        </div>
      </>
    );
  } catch (error) {
    console.error("Error loading data:", error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Works</h1>
          <p className="text-gray-600">Error loading works data</p>
          <p className="text-sm text-red-600 mt-2">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }
}
