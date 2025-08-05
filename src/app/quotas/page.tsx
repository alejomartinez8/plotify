import { getQuotaConfigs } from "@/lib/database/quotas";
import { isAuthenticated } from "@/lib/auth";
import QuotaView from "@/components/shared/QuotaView";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";

export default async function QuotasPage() {
  try {
    const [quotaConfigs, isAdmin] = await Promise.all([
      getQuotaConfigs(),
      isAuthenticated(),
    ]);

    return (
      <QuotaView 
        quotaConfigs={quotaConfigs} 
        isAuthenticated={isAdmin}
      />
    );
  } catch (error) {
    console.error("Error loading quotas data:", error);
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