import { NextRequest, NextResponse } from "next/server";
import { googleOAuthService } from "@/lib/services/google-oauth-service";
import { revalidatePath } from "next/cache";

export async function DELETE(req: NextRequest) {
  try {
    // Check if Google OAuth is configured
    if (
      !process.env.GOOGLE_CLIENT_ID ||
      !process.env.GOOGLE_CLIENT_SECRET ||
      !process.env.GOOGLE_REFRESH_TOKEN
    ) {
      return NextResponse.json(
        { error: "Google OAuth not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");
    const recordId = searchParams.get("recordId");
    const recordType = searchParams.get("recordType") as
      | "contribution"
      | "expense";

    // Validate required parameters
    if (!fileId || !recordId || !recordType) {
      return NextResponse.json(
        { error: "Missing required parameters: fileId, recordId, recordType" },
        { status: 400 }
      );
    }

    if (recordType !== "contribution" && recordType !== "expense") {
      return NextResponse.json(
        { error: "Invalid recordType. Must be 'contribution' or 'expense'" },
        { status: 400 }
      );
    }

    // Delete receipt file from Google Drive and update database
    await googleOAuthService.deleteReceiptFile({
      fileId,
      recordId: parseInt(recordId),
      recordType,
    });

    // Revalidate relevant paths
    revalidatePath("/income");
    revalidatePath("/expenses");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: "Receipt deleted successfully",
    });
  } catch (error) {
    console.error("Receipt deletion error:", error);

    return NextResponse.json(
      {
        error: "Failed to delete receipt",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
