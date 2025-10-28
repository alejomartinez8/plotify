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

export function LoginButton() {
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Admin Login</CardTitle>
        <CardDescription>
          Sign in with your authorized Google account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleGoogleSignIn} className="w-full gap-2">
          <LogIn className="h-5 w-5" />
          Sign in with Google
        </Button>
      </CardContent>
    </Card>
  );
}
