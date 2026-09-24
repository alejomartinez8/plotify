import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/auth";
import { hasFullDataAccess } from "@/lib/data-visibility";

/**
 * Check if user has lot access, redirect to /unauthorized if not
 * Call this at the top of protected pages
 */
export async function checkLotAccess(): Promise<void> {
  const userRole = await getUserRole();

  // If user has no role (not admin and no lot assigned), redirect
  if (userRole === null) {
    redirect("/unauthorized");
  }
}

/**
 * Restrict a page to users with community-wide access (admin/treasurer).
 * Owners are sent back to the dashboard, which only shows their own lots.
 */
export async function checkFullDataAccess(): Promise<void> {
  const userRole = await getUserRole();

  if (userRole === null) {
    redirect("/unauthorized");
  } else if (!hasFullDataAccess(userRole)) {
    redirect("/");
  }
}
