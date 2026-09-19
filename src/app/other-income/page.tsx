import { getOtherIncomes } from "@/lib/database/other-income";
import OtherIncomeView from "@/components/shared/OtherIncomeView";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";
import { getUserRole } from "@/lib/auth";
import { checkLotAccess } from "@/lib/check-lot-access";

export default async function OtherIncomePage() {
  await checkLotAccess();

  let otherIncomes: Awaited<ReturnType<typeof getOtherIncomes>>;
  let userRole: Awaited<ReturnType<typeof getUserRole>>;

  try {
    [otherIncomes, userRole] = await Promise.all([
      getOtherIncomes(),
      getUserRole(),
    ]);
  } catch (error) {
    return (
      <ErrorLayout
        title={translations.navigation.otherIncome}
        message={translations.errors.loadingIncome}
        error={
          error instanceof Error ? error.message : translations.errors.unknown
        }
      />
    );
  }

  return (
    <OtherIncomeView
      title={translations.navigation.otherIncome}
      otherIncomes={otherIncomes}
      isAdmin={userRole === "admin"}
      isTreasurer={userRole === "treasurer"}
    />
  );
}
