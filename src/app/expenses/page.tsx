import { getExpenses } from "@/lib/database/expenses";
import ExpensePageList from "@/components/shared/ExpensePageList";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";

export default async function ExpensesPage() {
  try {
    const expenses = await getExpenses();

    return (
      <ExpensePageList
        title={translations.navigation.expenses}
        expenses={expenses}
      />
    );
  } catch (error) {
    console.error("Error loading data:", error);
    return (
      <ErrorLayout
        title={translations.navigation.expenses}
        message={translations.errors.loadingExpenses}
        error={error instanceof Error ? error.message : translations.errors.unknown}
      />
    );
  }
}
