import { requireAdmin } from "@/lib/auth";
import { getTreasurers } from "@/lib/database/treasurers";
import AdminConfig from "@/components/admin/AdminConfig";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";

export default async function AdminPage() {
  try {
    await requireAdmin();

    const treasurers = await getTreasurers();

    return <AdminConfig treasurers={treasurers} />;
  } catch (error) {
    console.error("Admin page error:", error);
    return (
      <ErrorLayout
        title={translations.errors.access.title}
        message={translations.errors.access.noPermission}
        error={translations.errors.unknown}
      />
    );
  }
}
