"use client";

import { useEffect, useActionState, useTransition } from "react";
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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state, onClose]);

  const handleSubmit = (formData: FormData) => {
    startTransition(() => {
      const updatedExpense: Expense = {
        id: expense?.id || 0, // Will be generated by database for new expenses
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
              disabled={isPending}
            />
            {state.errors?.receiptNumber && (
              <div className="text-destructive text-sm">
                {state.errors.receiptNumber}
              </div>
            )}
          </div>
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
            disabled={isPending}
          >
            {isPending
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
