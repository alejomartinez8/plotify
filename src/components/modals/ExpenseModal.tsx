"use client";

import { useEffect, useActionState, useTransition, useState } from "react";
import { Expense } from "@/types/expenses.types";
import {
  createExpenseAction,
  updateExpenseAction,
  ExpenseState,
} from "@/lib/actions/expense-actions";
import { translations } from "@/lib/translations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { FileUpload } from "@/components/ui/FileUpload";
import { cn } from "@/lib/utils";

interface ExpenseModalProps {
  expense?: Expense | null;
  onClose: () => void;
  onSuccess: (expense: Expense, isUpdate: boolean) => void;
}

export default function ExpenseModal({
  onClose,
  expense,
  onSuccess,
}: ExpenseModalProps) {
  const initialState: ExpenseState = { message: null, errors: {} };
  const action = expense ? updateExpenseAction : createExpenseAction;
  const [state, formAction] = useActionState(action, initialState);
  const [isPending, startTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state, onClose]);

  const handleSubmit = async (formData: FormData) => {
    setIsUploading(true);
    
    try {
      let fileData = null;
      
      // Upload file if selected
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", selectedFile);
        uploadFormData.append("type", "expense");
        uploadFormData.append("date", formData.get("date") as string);
        uploadFormData.append("amount", formData.get("amount") as string);
        uploadFormData.append("receiptNumber", formData.get("receiptNumber") as string || "");
        uploadFormData.append("category", formData.get("category") as string);

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
      }

      // Add file data to form
      if (fileData) {
        formData.append("receiptFileId", fileData.id);
        formData.append("receiptFileUrl", fileData.url);
        formData.append("receiptFileName", fileData.name);
      }

      startTransition(() => {
        const updatedExpense: Expense = {
          id: expense?.id || 0,
          type: formData.get("type") as "maintenance" | "works",
          amount: parseFloat(formData.get("amount") as string),
          date: formData.get("date") as string,
          description: formData.get("description") as string,
          category: formData.get("category") as string,
          receiptNumber: formData.get("receiptNumber") as string,
        };
        onSuccess(updatedExpense, !!expense);
        formAction(formData);
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      // Show error to user
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {expense
              ? translations.titles.editExpense
              : translations.titles.registerExpense}
          </DialogTitle>
        </DialogHeader>

        <form id="expense-form" action={handleSubmit} className="space-y-4">
          {state.message && (
            <div
              className={cn(
                "mb-4 text-sm",
                state.message.includes("successfully")
                  ? "text-emerald-600"
                  : "text-destructive"
              )}
            >
              {state.message}
            </div>
          )}

          {expense && <input type="hidden" name="id" value={expense.id} />}
          <div className="space-y-2">
            <Label htmlFor="type">{translations.labels.type}</Label>
            <Select
              name="type"
              defaultValue={expense?.type || "maintenance"}
              required
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maintenance">
                  {translations.labels.maintenance}
                </SelectItem>
                <SelectItem value="works">
                  {translations.labels.works}
                </SelectItem>
              </SelectContent>
            </Select>
            {state.errors?.type && (
              <div className="text-destructive text-sm">
                {state.errors.type}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">{translations.labels.amount}</Label>
            <Input
              type="number"
              name="amount"
              id="amount"
              defaultValue={expense?.amount || ""}
              required
              min="0"
              step="1"
              disabled={isPending}
            />
            {state.errors?.amount && (
              <div className="text-destructive text-sm">
                {state.errors.amount}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">{translations.labels.date}</Label>
            <Input
              type="date"
              name="date"
              id="date"
              defaultValue={expense?.date || ""}
              required
              disabled={isPending}
            />
            {state.errors?.date && (
              <div className="text-destructive text-sm">
                {state.errors.date}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              {translations.labels.description}
            </Label>
            <Input
              type="text"
              name="description"
              id="description"
              defaultValue={expense?.description || ""}
              placeholder={translations.placeholders.optionalDescription}
              disabled={isPending}
            />
            {state.errors?.description && (
              <div className="text-destructive text-sm">
                {state.errors.description}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">{translations.labels.category}</Label>
            <Input
              type="text"
              name="category"
              id="category"
              defaultValue={expense?.category || ""}
              placeholder={translations.placeholders.categoryExample}
              required
              disabled={isPending}
            />
            {state.errors?.category && (
              <div className="text-destructive text-sm">
                {state.errors.category}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiptNumber">
              {translations.labels.receiptNumber}
            </Label>
            <Input
              type="text"
              name="receiptNumber"
              id="receiptNumber"
              defaultValue={expense?.receiptNumber || ""}
              placeholder={translations.placeholders.receiptNumber}
              disabled={isPending || isUploading}
            />
            {state.errors?.receiptNumber && (
              <div className="text-destructive text-sm">
                {state.errors.receiptNumber}
              </div>
            )}
          </div>

          <FileUpload
            onFileSelect={setSelectedFile}
            value={selectedFile}
            disabled={isPending || isUploading}
            showPreview={true}
            previewFileName={expense?.receiptFileName || undefined}
          />
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            {translations.actions.cancel}
          </Button>
          <Button
            type="submit"
            form="expense-form"
            variant="secondary"
            disabled={isPending || isUploading}
          >
            {isPending || isUploading
              ? translations.status.processing
              : expense
                ? translations.actions.update
                : translations.actions.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
