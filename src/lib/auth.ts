import { cookies } from "next/headers";

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("admin-auth")?.value === "true";
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
}

export async function requireAuth(): Promise<boolean> {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    throw new Error("Authentication required");
  }
  return true;
}