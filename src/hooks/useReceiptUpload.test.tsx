import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useReceiptUpload } from "./useReceiptUpload";

function makeFormData(overrides: Record<string, string> = {}): FormData {
  const formData = new FormData();
  formData.set("date", overrides.date ?? "2026-01-15");
  formData.set("amount", overrides.amount ?? "5000");
  formData.set("receiptNumber", overrides.receiptNumber ?? "REC-1");
  return formData;
}

describe("useReceiptUpload", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does nothing when no file is selected and there is no existing receipt", async () => {
    const { result } = renderHook(() => useReceiptUpload());
    const formData = makeFormData();

    await act(async () => {
      await result.current.uploadReceipt({
        type: "income",
        formData,
        selectedFile: null,
      });
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(formData.get("receiptFileId")).toBeNull();
  });

  it("preserves the existing receipt when updating without a new file", async () => {
    const { result } = renderHook(() => useReceiptUpload());
    const formData = makeFormData();

    await act(async () => {
      await result.current.uploadReceipt({
        type: "income",
        formData,
        selectedFile: null,
        existingRecord: {
          receiptFileId: "existing-id",
          receiptFileUrl: "https://example.com/file",
          receiptFileName: "receipt.pdf",
        },
      });
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(formData.get("receiptFileId")).toBe("existing-id");
    expect(formData.get("receiptFileUrl")).toBe("https://example.com/file");
    expect(formData.get("receiptFileName")).toBe("receipt.pdf");
  });

  it("uploads a new file and appends the returned file data to the form", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        file: { id: "new-id", name: "new.pdf", url: "https://example.com/new" },
      }),
    } as Response);

    const { result } = renderHook(() => useReceiptUpload());
    const formData = makeFormData();
    const file = new File(["content"], "receipt.pdf", {
      type: "application/pdf",
    });

    await act(async () => {
      await result.current.uploadReceipt({
        type: "expense",
        formData,
        selectedFile: file,
        additionalData: { category: "Utilities" },
      });
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/upload",
      expect.objectContaining({ method: "POST" })
    );
    const uploadBody = vi.mocked(fetch).mock.calls[0][1]?.body as FormData;
    expect(uploadBody.get("type")).toBe("expense");
    expect(uploadBody.get("category")).toBe("Utilities");
    expect(formData.get("receiptFileId")).toBe("new-id");
    expect(formData.get("receiptFileUrl")).toBe("https://example.com/new");
    expect(formData.get("receiptFileName")).toBe("new.pdf");
  });

  it("resets isUploading and propagates the error when the upload fails", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Upload rejected" }),
    } as Response);

    const { result } = renderHook(() => useReceiptUpload());
    const file = new File(["content"], "receipt.pdf");

    await expect(
      act(async () => {
        await result.current.uploadReceipt({
          type: "income",
          formData: makeFormData(),
          selectedFile: file,
        });
      })
    ).rejects.toThrow("Upload rejected");

    await waitFor(() => {
      expect(result.current.isUploading).toBe(false);
    });
  });
});
