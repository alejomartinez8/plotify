"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { LogIn } from "lucide-react";
import { translations } from "@/lib/translations";

export function LoginButton() {
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">
          {translations.auth.adminLogin}
        </CardTitle>
        <CardDescription>
          {translations.auth.signInDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleGoogleSignIn} className="w-full gap-2">
          <LogIn className="h-5 w-5" />
          {translations.auth.signInWithGoogle}
        </Button>
      </CardContent>
    </Card>
  );
}
