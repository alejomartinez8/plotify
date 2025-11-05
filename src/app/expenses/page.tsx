import { getExpenses } from "@/lib/database/expenses";
import ExpenseView from "@/components/shared/ExpenseView";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";
import { getUserRole } from "@/lib/auth";

export default async function ExpensesPage() {
  try {
    const [expenses, userRole] = await Promise.all([
      getExpenses(),
      getUserRole(),
    ]);

    return (
      <ExpenseView
        title={translations.navigation.expenses}
        expenses={expenses}
        isAdmin={userRole === "admin"}
      />
    );
  } catch (error) {
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
