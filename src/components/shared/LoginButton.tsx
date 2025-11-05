"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { LogIn } from "lucide-react";
import { translations } from "@/lib/translations";

export function LoginButton() {
  const [isPending, setIsPending] = useState(false);

  const handleLogin = async () => {
    setIsPending(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Login error:", error);
      setIsPending(false);
    }
  };

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleLogin}
      disabled={isPending}
    >
      {isPending ? (
        <>
          <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
          {translations.auth.signingIn}
        </>
      ) : (
        <>
          <LogIn className="mr-2 h-4 w-4" />
          {translations.auth.login}
        </>
      )}
    </Button>
  );
}
