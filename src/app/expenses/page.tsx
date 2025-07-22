import { getExpenses } from "@/lib/database/expenses";
import ExpenseList from "@/components/shared/ExpenseList";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";

export default async function ExpensesPage() {
  try {
    const expenses = await getExpenses();

    return (
      <ExpenseList
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
