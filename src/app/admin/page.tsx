import { requireAdmin, getUserEmail } from "@/lib/auth";
import { getUsers } from "@/lib/database/users";
import AdminConfig from "@/components/admin/AdminConfig";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";

export default async function AdminPage() {
  let users: Awaited<ReturnType<typeof getUsers>>;
  let currentUserEmail: Awaited<ReturnType<typeof getUserEmail>>;

  try {
    await requireAdmin();

    [users, currentUserEmail] = await Promise.all([
      getUsers(),
      getUserEmail(),
    ]);
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

  return <AdminConfig users={users} currentUserEmail={currentUserEmail} />;
}
