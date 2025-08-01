import { getExpenses } from "@/lib/database/expenses";
import ExpenseView from "@/components/shared/ExpenseView";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";
import { isAuthenticated } from "@/lib/auth";

export default async function ExpensesPage() {
  try {
    const [expenses, isAdmin] = await Promise.all([
      getExpenses(),
      isAuthenticated(),
    ]);

    return (
      <ExpenseView
        title={translations.navigation.expenses}
        expenses={expenses}
        isAuthenticated={isAdmin}
      />
    );
  } catch (error) {
    console.error("Error loading data:", error);
    return (
      <ErrorLayout
        title={translations.navigation.expenses}
        message={translations.errors.loadingExpenses}
        error={
          error instanceof Error ? error.message : translations.errors.unknown
        }
      />
    );
  }
}
