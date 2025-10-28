import { NextResponse } from "next/server";
import { googleOAuthService } from "@/lib/services/google-oauth-service";

export async function GET() {
  try {
    // Generate authorization URL
    const authUrl = googleOAuthService.getAuthUrl();

    // Redirect to Google authorization page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Error generating auth URL:", error);
    return NextResponse.json(
      { error: "Failed to generate authorization URL" },
      { status: 500 }
    );
  }
}
