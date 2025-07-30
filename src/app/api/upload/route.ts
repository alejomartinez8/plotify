import { NextRequest, NextResponse } from "next/server";
import { googleOAuthService } from "@/lib/services/google-oauth-service";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg", 
  "image/png",
  "image/webp"
];

export async function POST(req: NextRequest) {
  try {
    // Check if Google OAuth is configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
      console.error("Google OAuth configuration missing:", {
        hasClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasRefreshToken: !!process.env.GOOGLE_REFRESH_TOKEN,
      });
      return NextResponse.json(
        { error: "Google OAuth not configured. Please complete authorization first." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as "income" | "expense";
    const date = formData.get("date") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const receiptNumber = formData.get("receiptNumber") as string;
    
    // Optional fields based on type
    const lotNumber = formData.get("lotNumber") as string;
    const fundType = formData.get("fundType") as string;
    const category = formData.get("category") as string;

    // Validate required fields
    if (!file || !type || !date || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: file, type, date, amount" },
        { status: 400 }
      );
    }

    // Validate file
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PDF, JPG, PNG, WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size: 10MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Upload to Google Drive via OAuth
    const uploadedFile = await googleOAuthService.uploadReceipt({
      file: fileBuffer,
      originalName: file.name,
      mimeType: file.type,
      date,
      type,
      lotNumber,
      category,
      fundType,
      amount,
      receiptNumber,
    });

    return NextResponse.json({
      success: true,
      file: {
        id: uploadedFile.id,
        name: uploadedFile.name,
        url: uploadedFile.url,
        downloadUrl: uploadedFile.downloadUrl,
      },
    });

  } catch (error) {
    console.error("Upload error:", error);
    
    // Return more detailed error information
    return NextResponse.json(
      { 
        error: "Failed to upload file",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : null
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    await googleOAuthService.deleteFile(fileId);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}