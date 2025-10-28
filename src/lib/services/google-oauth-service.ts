import { google } from "googleapis";
import { Readable } from "stream";

interface DriveFile {
  id: string;
  name: string;
  url: string;
  downloadUrl: string;
}

class GoogleOAuthService {
  private oauth2Client;
  private drive;

  constructor() {
    try {
      // Initialize OAuth2 client
      this.oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        "http://localhost:3000/api/auth/google/callback" // Redirect URI
      );

      // Set refresh token for automatic access token renewal
      if (process.env.GOOGLE_REFRESH_TOKEN) {
        this.oauth2Client.setCredentials({
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        });
      }

      this.drive = google.drive({ version: "v3", auth: this.oauth2Client });
      console.log("Google OAuth service initialized successfully");
    } catch (error) {
      console.error("Error initializing Google OAuth service:", error);
      throw error;
    }
  }

  /**
   * Generates authorization URL for initial setup
   */
  getAuthUrl(): string {
    const scopes = ["https://www.googleapis.com/auth/drive.file"];

    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent", // Force refresh token generation
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokens(code: string) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      return tokens;
    } catch (error) {
      console.error("Error getting tokens:", error);
      throw error;
    }
  }

  /**
   * Generates a standardized filename for receipts with sequential counter
   */
  async generateFileName(
    data: {
      date: string;
      type: "income" | "expense";
      lotNumber?: string;
      category?: string;
      amount: number;
      receiptNumber?: string;
      fileExtension: string;
    },
    folderId: string
  ): Promise<string> {
    const { date, type, lotNumber, category, fileExtension } = data;

    // Format date as YYYY-MM-DD
    const formattedDate = new Date(date).toISOString().split("T")[0];

    // Generate base filename without counter
    let baseFileName: string;
    if (type === "income") {
      const lot = lotNumber ? `lote-${lotNumber.padStart(2, "0")}` : "lote-XX";
      baseFileName = `${formattedDate}_${lot}`;
    } else {
      const cat = category || "general";
      baseFileName = `${formattedDate}_gasto-${cat}`;
    }

    // Receipt number is not added to filename - stored only in database

    // Find next available counter
    const counter = await this.getNextFileCounter(
      baseFileName,
      fileExtension,
      folderId
    );

    return `${baseFileName}_${counter.toString().padStart(3, "0")}.${fileExtension}`;
  }

  /**
   * Gets the next available file counter for a base filename
   */
  private async getNextFileCounter(
    baseFileName: string,
    extension: string,
    folderId: string
  ): Promise<number> {
    try {
      // Search for existing files with this base name pattern
      const searchQuery = `name contains '${baseFileName}_' and parents in '${folderId}'`;
      const response = await this.drive.files.list({
        q: searchQuery,
        fields: "files(name)",
      });

      const existingFiles = response.data.files || [];
      const counters: number[] = [];

      // Extract counters from existing filenames
      existingFiles.forEach((file) => {
        if (file.name) {
          const match = file.name.match(
            new RegExp(
              `${baseFileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}_(\d{3})\.${extension}$`
            )
          );
          if (match) {
            counters.push(parseInt(match[1], 10));
          }
        }
      });

      // Return next available counter (starting from 1)
      if (counters.length === 0) {
        return 1;
      }

      counters.sort((a, b) => a - b);
      let nextCounter = 1;
      for (const counter of counters) {
        if (counter === nextCounter) {
          nextCounter++;
        } else {
          break;
        }
      }

      return nextCounter;
    } catch (error) {
      console.error("Error getting file counter:", error);
      // Fallback to timestamp-based counter if API fails
      return Date.now() % 1000;
    }
  }

  /**
   * Creates year-based folder structure if it doesn't exist
   */
  private async createFolderStructure(
    date: string,
    type: "income" | "expense"
  ): Promise<string> {
    const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!rootFolderId) {
      throw new Error("GOOGLE_DRIVE_FOLDER_ID not configured");
    }

    try {
      // Extract year from date
      const year = new Date(date).getFullYear().toString();
      const typeFolderName = type === "income" ? "Ingresos" : "Gastos";

      console.log(`Creating folder structure: ${year}/${typeFolderName}`);

      // Check if year folder exists
      let yearFolderId = await this.findFolder(year, rootFolderId);
      if (!yearFolderId) {
        console.log(`Year folder '${year}' not found, creating...`);
        yearFolderId = await this.createFolder(year, rootFolderId);
        console.log(`Year folder created: ${year} (ID: ${yearFolderId})`);
      } else {
        console.log(`Year folder found: ${year} (ID: ${yearFolderId})`);
      }

      // Check if type folder exists within year folder (Ingresos/Gastos)
      let typeFolderId = await this.findFolder(typeFolderName, yearFolderId);
      if (!typeFolderId) {
        console.log(
          `Type folder '${typeFolderName}' not found in year '${year}', creating...`
        );
        typeFolderId = await this.createFolder(typeFolderName, yearFolderId);
        console.log(
          `Type folder created: ${year}/${typeFolderName} (ID: ${typeFolderId})`
        );
      } else {
        console.log(
          `Type folder found: ${year}/${typeFolderName} (ID: ${typeFolderId})`
        );
      }

      console.log(
        `Folder structure ready: ${year}/${typeFolderName} (Final ID: ${typeFolderId})`
      );
      return typeFolderId;
    } catch (error) {
      console.error("Error creating folder structure:", error);
      console.log("Falling back to root folder");
      return rootFolderId; // Fallback to root folder
    }
  }

  /**
   * Finds folder by name within parent folder
   */
  private async findFolder(
    name: string,
    parentId: string
  ): Promise<string | null> {
    try {
      const response = await this.drive.files.list({
        q: `name='${name}' and parents in '${parentId}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: "files(id, name, createdTime)",
        orderBy: "createdTime",
      });

      const folders = response.data.files || [];
      if (folders.length > 1) {
        console.warn(
          `Found ${folders.length} duplicate folders with name '${name}' in parent '${parentId}'`
        );

        // Use the oldest folder (first created) and log the duplicates
        const primaryFolder = folders[0];
        const duplicates = folders.slice(1);

        console.log(
          `Using primary folder: ${primaryFolder.name} (ID: ${primaryFolder.id}, Created: ${primaryFolder.createdTime})`
        );
        console.log(
          `Found ${duplicates.length} duplicate folders that should be cleaned up:`,
          duplicates.map(
            (f) => `${f.name} (ID: ${f.id}, Created: ${f.createdTime})`
          )
        );

        // TODO: In the future, we could implement automatic cleanup of empty duplicate folders

        return primaryFolder.id || null;
      }

      return folders[0]?.id || null;
    } catch (error) {
      console.error("Error finding folder:", error);
      return null;
    }
  }

  /**
   * Creates a new folder (with duplicate check and retry logic)
   */
  private async createFolder(name: string, parentId: string): Promise<string> {
    try {
      // Double check if folder exists before creating (in case it was created by another process)
      const existingFolder = await this.findFolder(name, parentId);
      if (existingFolder) {
        console.log(
          `Folder '${name}' already exists, using existing one:`,
          existingFolder
        );
        return existingFolder;
      }

      console.log(`Creating new folder '${name}' in parent '${parentId}'`);
      const response = await this.drive.files.create({
        requestBody: {
          name,
          mimeType: "application/vnd.google-apps.folder",
          parents: [parentId],
        },
        fields: "id",
      });

      if (!response.data.id) {
        throw new Error(`Failed to create folder: ${name}`);
      }

      console.log(
        `Successfully created new folder '${name}':`,
        response.data.id
      );

      // Wait a moment for Google Drive to sync
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Verify the folder was created and return its ID
      const verifyFolder = await this.findFolder(name, parentId);
      if (verifyFolder) {
        return verifyFolder;
      }

      return response.data.id;
    } catch (error) {
      console.error(`Error creating folder '${name}':`, error);

      // If creation failed, try one more time to find existing folder
      const existingFolder = await this.findFolder(name, parentId);
      if (existingFolder) {
        console.log(
          `Found existing folder after failed creation: '${name}':`,
          existingFolder
        );
        return existingFolder;
      }
      throw error;
    }
  }

  /**
   * Uploads a file to Google Drive
   */
  async uploadFile(params: {
    file: Buffer;
    fileName: string;
    mimeType: string;
    folderId?: string;
  }): Promise<DriveFile> {
    const { file, fileName, mimeType, folderId } = params;

    try {
      console.log("Creating file in Google Drive:", {
        fileName,
        mimeType,
        folderId,
      });

      // Convert Buffer to readable stream
      const stream = new Readable();
      stream.push(file);
      stream.push(null); // End the stream

      const response = await this.drive.files.create({
        requestBody: {
          name: fileName,
          parents: folderId ? [folderId] : undefined,
        },
        media: {
          mimeType,
          body: stream,
        },
        fields: "id, name, webViewLink, webContentLink",
      });

      console.log("File created successfully:", response.data);

      // Make file publicly viewable
      if (response.data.id) {
        console.log("Setting file permissions to public");
        await this.drive.permissions.create({
          fileId: response.data.id,
          requestBody: {
            role: "reader",
            type: "anyone",
          },
        });
        console.log("Permissions set successfully");
      }

      return {
        id: response.data.id!,
        name: response.data.name!,
        url: response.data.webViewLink!,
        downloadUrl: response.data.webContentLink!,
      };
    } catch (error) {
      console.error("Error uploading file to Google Drive:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : null,
        // @ts-ignore
        code: error?.code,
        // @ts-ignore
        errors: error?.errors,
      });
      throw new Error(
        `Failed to upload file to Google Drive: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Uploads a receipt file with automatic naming and folder structure
   */
  async uploadReceipt(data: {
    file: Buffer;
    originalName: string;
    mimeType: string;
    date: string;
    type: "income" | "expense";
    lotNumber?: string;
    category?: string;
    amount: number;
    receiptNumber?: string;
  }): Promise<DriveFile> {
    try {
      console.log("Starting OAuth receipt upload:", {
        originalName: data.originalName,
        mimeType: data.mimeType,
        date: data.date,
        type: data.type,
        fileSize: data.file.length,
      });

      const fileExtension =
        data.originalName.split(".").pop()?.toLowerCase() || "pdf";

      // Create/find appropriate folder first
      const folderId = await this.createFolderStructure(data.date, data.type);
      console.log("Using folder ID:", folderId);

      // Generate standardized filename with sequential counter
      const fileName = await this.generateFileName(
        {
          date: data.date,
          type: data.type,
          lotNumber: data.lotNumber,
          category: data.category,
          amount: data.amount,
          receiptNumber: data.receiptNumber,
          fileExtension,
        },
        folderId
      );

      console.log("Generated filename:", fileName);

      // Upload file
      const result = await this.uploadFile({
        file: data.file,
        fileName,
        mimeType: data.mimeType,
        folderId,
      });

      console.log("OAuth upload successful:", result);
      return result;
    } catch (error) {
      console.error("Error in OAuth uploadReceipt:", error);
      throw error;
    }
  }

  /**
   * Deletes a file from Google Drive
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.drive.files.delete({
        fileId,
      });
      console.log("File deleted successfully from Google Drive:", fileId);
    } catch (error) {
      console.error("Error deleting file from Google Drive:", error);
      throw new Error("Failed to delete file from Google Drive");
    }
  }

  /**
   * Deletes a receipt file and updates the database record
   */
  async deleteReceiptFile(params: {
    fileId: string;
    recordId: number;
    recordType: "contribution" | "expense";
  }): Promise<void> {
    const { fileId, recordId, recordType } = params;

    try {
      console.log("Starting receipt deletion process:", {
        fileId,
        recordId,
        recordType,
      });

      // First, delete from Google Drive
      await this.deleteFile(fileId);

      // Then, update the database record to clear receipt fields
      if (recordType === "contribution") {
        const { updateContribution } = await import(
          "@/lib/database/contributions"
        );
        // Get current contribution data first
        const { getContributionById } = await import(
          "@/lib/database/contributions"
        );
        const contribution = await getContributionById(recordId);

        if (contribution) {
          await updateContribution(recordId, {
            lotId: contribution.lotId.toString(),
            type: contribution.type,
            amount: contribution.amount,
            date: contribution.date,
            description: contribution.description,
            receiptNumber: contribution.receiptNumber,
            receiptFileId: null,
            receiptFileUrl: null,
            receiptFileName: null,
          });
        }
      } else if (recordType === "expense") {
        const { updateExpense } = await import("@/lib/database/expenses");
        // Get current expense data first
        const { getExpenseById } = await import("@/lib/database/expenses");
        const expense = await getExpenseById(recordId);

        if (expense) {
          await updateExpense(recordId, {
            type: expense.type,
            amount: expense.amount,
            date: expense.date,
            description: expense.description,
            category: expense.category,
            receiptNumber: expense.receiptNumber,
            receiptFileId: null,
            receiptFileUrl: null,
            receiptFileName: null,
          });
        }
      }

      console.log("Receipt deletion completed successfully");
    } catch (error) {
      console.error("Error in deleteReceiptFile:", error);
      throw new Error(
        `Failed to delete receipt: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Gets file metadata
   */
  async getFileMetadata(fileId: string): Promise<DriveFile> {
    try {
      const response = await this.drive.files.get({
        fileId,
        fields: "id, name, webViewLink, webContentLink",
      });

      return {
        id: response.data.id!,
        name: response.data.name!,
        url: response.data.webViewLink!,
        downloadUrl: response.data.webContentLink!,
      };
    } catch (error) {
      console.error("Error getting file metadata:", error);
      throw new Error("Failed to get file metadata");
    }
  }
}

// Singleton instance
export const googleOAuthService = new GoogleOAuthService();
export type { DriveFile };
