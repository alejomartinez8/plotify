import { getExpenses } from "@/lib/database/expenses";
import ExpenseView from "@/components/shared/ExpenseView";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";
import { getUserRole } from "@/lib/auth";
import { checkLotAccess } from "@/lib/check-lot-access";

export default async function ExpensesPage() {
  await checkLotAccess();

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
