"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";

interface AuthButtonProps {
  isAuthenticated: boolean;
}

export function AuthButton({ isAuthenticated }: AuthButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
        });
        router.refresh();
      } catch (error) {
        console.error("Logout error:", error);
      }
    });
  };

  const handleLogin = () => {
    router.push("/login");
  };

  if (isAuthenticated) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        disabled={isPending}
      >
        {isPending ? (
          <>
            <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            Signing out...
          </>
        ) : (
          <>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </>
        )}
      </Button>
    );
  }

  return (
    <Button variant="default" size="sm" onClick={handleLogin}>
      <LogIn className="mr-2 h-4 w-4" />
      Admin Login
    </Button>
  );
}