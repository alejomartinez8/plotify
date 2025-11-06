import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/auth";

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
