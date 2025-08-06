"use client";

import { useEffect, useActionState, useTransition, useState } from "react";
import { useReceiptUpload } from "@/hooks/useReceiptUpload";
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
import { FileUpload } from "@/components/ui/FileUpload";
import { cn, formatDateForStorage } from "@/lib/utils";

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
  const [, startTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewFileName, setPreviewFileName] = useState<string | undefined>(
    expense?.receiptFileName || undefined
  );
  const { uploadReceipt, isUploading } = useReceiptUpload();

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state, onClose]);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Handle receipt upload for new files OR preserve existing receipt data
      if (selectedFile || (expense && expense.receiptFileId)) {
        const additionalData: Record<string, string> = {
          category: formData.get("category") as string,
        };

        await uploadReceipt({
          type: "expense",
          formData,
          selectedFile,
          existingRecord: expense,
          additionalData,
        });
      }

      startTransition(() => {
        const updatedExpense: Expense = {
          id: expense?.id || 0,
          type: "general",
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
      const errorInstance = error instanceof Error ? error : new Error(String(error));
      // Show error to user
      alert(`Error: ${errorInstance.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
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
          <input type="hidden" name="type" value="general" />

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
              disabled={isSubmitting}
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
              defaultValue={expense?.date ? formatDateForStorage(expense.date) : ""}
              required
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
            disabled={isSubmitting || isUploading}
            showPreview={true}
            previewFileName={previewFileName}
            onRemovePreview={() => setPreviewFileName(undefined)}
          />
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting || isUploading}
          >
            {translations.actions.cancel}
          </Button>
          <Button
            type="submit"
            form="expense-form"
            variant="secondary"
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting || isUploading
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
