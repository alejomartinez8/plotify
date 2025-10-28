import { NextRequest, NextResponse } from "next/server";
import { googleOAuthService } from "@/lib/services/google-oauth-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.json(
        { error: `Authorization failed: ${error}` },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code not provided" },
        { status: 400 }
      );
    }

    // Exchange code for tokens
    const tokens = await googleOAuthService.getTokens(code);

    return NextResponse.json({
      success: true,
      message:
        "Authorization successful! Copy the refresh_token to your .env file.",
      tokens: {
        refresh_token: tokens.refresh_token,
        access_token: tokens.access_token,
        scope: tokens.scope,
        token_type: tokens.token_type,
        expiry_date: tokens.expiry_date,
      },
    });
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.json(
      { error: "Failed to process authorization callback" },
      { status: 500 }
    );
  }
}
