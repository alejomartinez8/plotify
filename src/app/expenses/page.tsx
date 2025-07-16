import { getLotsData, getExpenses } from "@/lib/data";
import NavigationClient from "@/components/shared/NavigationClient";
import ExpenseList from "@/components/shared/ExpenseList";

export default async function ExpensesPage() {
  try {
    const [lots, expenses] = await Promise.all([getLotsData(), getExpenses()]);

    return (
      <>
        <NavigationClient lots={lots} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ExpenseList
                title="Maintenance Expenses"
                expenses={expenses}
                type="maintenance"
                color="blue"
              />
              <ExpenseList
                title="Works Expenses"
                expenses={expenses}
                type="works"
                color="orange"
              />
            </div>
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error("Error loading data:", error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Expenses</h1>
          <p className="text-gray-600">Error loading expenses data</p>
          <p className="text-sm text-red-600 mt-2">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }
}
