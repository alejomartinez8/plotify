"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { LogOut } from "lucide-react";
import { translations } from "@/lib/translations";

export function AuthButton() {
  const [isPending, setIsPending] = useState(false);

  const handleLogout = async () => {
    setIsPending(true);
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Logout error:", error);
      setIsPending(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={isPending}
    >
      {isPending ? (
        <>
          <div className="border-muted-foreground mr-2 h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" />
          {translations.auth.signingOut}
        </>
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          {translations.auth.logout}
        </>
      )}
    </Button>
  );
}
