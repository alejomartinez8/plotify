import { getQuotaConfigs } from "@/lib/database/quotas";
import { getUserRole } from "@/lib/auth";
import { checkLotAccess } from "@/lib/check-lot-access";
import QuotaView from "@/components/shared/QuotaView";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";

export default async function QuotasPage() {
  await checkLotAccess();

  try {
    const [quotaConfigs, userRole] = await Promise.all([
      getQuotaConfigs(),
      getUserRole(),
    ]);

    return (
      <QuotaView quotaConfigs={quotaConfigs} isAdmin={userRole === "admin"} />
    );
  } catch (error) {
    return (
      <ErrorLayout
        title={translations.navigation.quotas}
        message="Error cargando datos de cuotas"
        error={
          error instanceof Error ? error.message : translations.errors.unknown
        }
      />
    );
  }
}
