import { requireAuth } from "@/lib/auth";
import AdminConfig from "@/components/admin/AdminConfig";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";

export default async function AdminPage() {
  try {
    await requireAuth();

    return <AdminConfig />;
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
