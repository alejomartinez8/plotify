import { requireAdmin, getUserEmail } from "@/lib/auth";
import { getUsers } from "@/lib/database/users";
import AdminConfig from "@/components/admin/AdminConfig";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";

export default async function AdminPage() {
  try {
    await requireAdmin();

    const [users, currentUserEmail] = await Promise.all([
      getUsers(),
      getUserEmail(),
    ]);

    return <AdminConfig users={users} currentUserEmail={currentUserEmail} />;
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
