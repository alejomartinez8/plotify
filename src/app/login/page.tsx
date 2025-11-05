import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginCard } from "@/components/ui/LoginCard";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginCard />
      </div>
    </div>
  );
}

export const metadata = {
  title: "Admin Login - Plotify",
  description: "Sign in with Google to access admin features",
};
