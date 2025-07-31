import { NextRequest, NextResponse } from "next/server";
import { googleOAuthService } from "@/lib/services/google-oauth-service";
import { logger } from "@/lib/logger";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg", 
  "image/png",
  "image/webp"
];

export async function POST(req: NextRequest) {
  const requestLogger = logger.withRequest(req);
  const timer = logger.timer('Upload API');
  
  try {
    requestLogger.apiRequest();
    
    // Check if Google OAuth is configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
      logger.error("Google OAuth configuration missing", undefined, {
        hasClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasRefreshToken: !!process.env.GOOGLE_REFRESH_TOKEN,
      });
      const duration = timer.end();
      requestLogger.apiResponse(500, duration);
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
    const category = formData.get("category") as string;

    logger.debug("Upload API received form data", {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      type,
      date,
      amount,
      receiptNumber: receiptNumber || '[empty]',
      lotNumber: lotNumber || '[empty]',
      category: category || '[empty]'
    });

    // Validate required fields
    if (!file || !type || !date || !amount) {
      logger.validation('error', 'required_fields', { file: !!file, type, date, amount }, 
        "Missing required fields: file, type, date, amount");
      
      const duration = timer.end();
      requestLogger.apiResponse(400, duration);
      return NextResponse.json(
        { error: "Missing required fields: file, type, date, amount" },
        { status: 400 }
      );
    }

    // Validate file
    if (!ALLOWED_TYPES.includes(file.type)) {
      logger.validation('error', 'file_type', file.type, `Invalid file type: ${file.type}`);
      const duration = timer.end();
      requestLogger.apiResponse(400, duration);
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PDF, JPG, PNG, WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      logger.validation('error', 'file_size', file.size, `File too large: ${file.size} bytes`);
      const duration = timer.end();
      requestLogger.apiResponse(400, duration);
      return NextResponse.json(
        { error: "File too large. Maximum size: 10MB" },
        { status: 400 }
      );
    }

    logger.uploadStart(file.type, file.name, file.size);

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Upload to Google Drive via OAuth
    const uploadTimer = logger.timer('Google Drive Upload');
    const uploadedFile = await googleOAuthService.uploadReceipt({
      file: fileBuffer,
      originalName: file.name,
      mimeType: file.type,
      date,
      type,
      lotNumber,
      category,
      amount,
      receiptNumber,
    });
    const uploadDuration = uploadTimer.end();

    logger.uploadSuccess(file.name, uploadedFile.id, uploadDuration);
    
    const totalDuration = timer.end();
    requestLogger.apiResponse(200, totalDuration, { 
      fileId: uploadedFile.id,
      fileName: uploadedFile.name 
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
    const errorInstance = error instanceof Error ? error : new Error(String(error));
    logger.uploadError('unknown_file', errorInstance);
    
    const duration = timer.end();
    requestLogger.apiResponse(500, duration, { error: errorInstance.message });
    
    // Return more detailed error information
    return NextResponse.json(
      { 
        error: "Failed to upload file",
        details: errorInstance.message,
        stack: process.env.NODE_ENV === 'development' ? errorInstance.stack : null
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