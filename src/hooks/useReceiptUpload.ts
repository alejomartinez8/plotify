import { useState } from "react";

interface ReceiptUploadParams {
  type: "income" | "expense";
  formData: FormData;
  selectedFile: File | null;
  existingRecord?: {
    receiptFileId?: string | null;
    receiptFileUrl?: string | null;
    receiptFileName?: string | null;
  } | null;
  previewFileName?: string;
  additionalData?: Record<string, string>;
}

interface FileUploadResult {
  id: string;
  name: string;
  url: string;
  downloadUrl: string;
}

export function useReceiptUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadReceipt = async ({
    type,
    formData,
    selectedFile,
    existingRecord,
    previewFileName,
    additionalData = {},
  }: ReceiptUploadParams): Promise<void> => {
    let fileData: FileUploadResult | null = null;

    // Upload file only if a new file is selected
    if (selectedFile) {
      setIsUploading(true);
      
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", selectedFile);
        uploadFormData.append("type", type);
        uploadFormData.append("date", formData.get("date") as string);
        uploadFormData.append("amount", formData.get("amount") as string);
        uploadFormData.append("receiptNumber", formData.get("receiptNumber") as string || "");

        // Add additional data specific to each modal
        Object.entries(additionalData).forEach(([key, value]) => {
          uploadFormData.append(key, value);
        });

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const errorDetails = await uploadResponse.json();
          console.error("Upload failed:", errorDetails);
          throw new Error(errorDetails.details || errorDetails.error || "Failed to upload file");
        }

        const uploadResult = await uploadResponse.json();
        fileData = uploadResult.file;
      } finally {
        setIsUploading(false);
      }
    }

    // Add file data to form (new upload or preserve existing)
    if (fileData) {
      // New file uploaded
      formData.append("receiptFileId", fileData.id);
      formData.append("receiptFileUrl", fileData.url);
      formData.append("receiptFileName", fileData.name);
    } else if (existingRecord?.receiptFileId && !selectedFile && previewFileName) {
      // Preserve existing file data when updating without new file and preview not removed
      formData.append("receiptFileId", existingRecord.receiptFileId);
      formData.append("receiptFileUrl", existingRecord.receiptFileUrl || "");
      formData.append("receiptFileName", existingRecord.receiptFileName || "");
    }
  };

  return {
    uploadReceipt,
    isUploading,
  };
}