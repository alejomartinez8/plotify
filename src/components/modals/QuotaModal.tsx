"use client";

import { useEffect, useActionState, useTransition } from "react";
import { QuotaConfig } from "@/lib/database/quotas";
import {
  createQuotaConfigAction,
  updateQuotaConfigAction,
  QuotaState,
} from "@/lib/actions/quota-actions";
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
import { cn } from "@/lib/utils";

interface QuotaModalProps {
  quota?: QuotaConfig | null;
  onClose: () => void;
  onSuccess: (quota: QuotaConfig, isUpdate: boolean) => void;
}

export default function QuotaModal({ onClose, quota, onSuccess }: QuotaModalProps) {
  const initialState: QuotaState = { message: null, errors: {} };
  const action = quota ? updateQuotaConfigAction : createQuotaConfigAction;
  const [state, formAction] = useActionState(action, initialState);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state, onClose]);

  const handleSubmit = (formData: FormData) => {
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {quota ? translations.titles.editQuota : translations.titles.newQuota}
          </DialogTitle>
        </DialogHeader>

        <form id="quota-form" action={handleSubmit} className="space-y-4">
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

          {quota && <input type="hidden" name="id" value={quota.id} />}



          <div className="space-y-2">
            <Label htmlFor="quotaType">Tipo de Cuota</Label>
            <Select name="quotaType" defaultValue={quota?.quotaType || "maintenance"} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maintenance">{translations.titles.quotaTypesMaintenance}</SelectItem>
                <SelectItem value="works">{translations.titles.quotaTypesWorks}</SelectItem>
              </SelectContent>
            </Select>
            {state.errors?.quotaType && (
              <div className="text-destructive text-sm">
                {state.errors.quotaType}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <Input
              type="number"
              name="amount"
              id="amount"
              defaultValue={quota?.amount || ""}
              placeholder={translations.titles.quotaAmountPlaceholder}
              min="0"
              required
              disabled={isPending}
            />
            {state.errors?.amount && (
              <div className="text-destructive text-sm">
                {state.errors.amount}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Input
              type="text"
              name="description"
              id="description"
              defaultValue={quota?.description || ""}
              placeholder={translations.titles.quotaDescriptionPlaceholder}
              disabled={isPending}
            />
            {state.errors?.description && (
              <div className="text-destructive text-sm">
                {state.errors.description}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Fecha de vencimiento *</Label>
            <Input
              type="date"
              name="dueDate"
              id="dueDate"
              defaultValue={quota?.dueDate ? new Date(quota.dueDate).toISOString().split('T')[0] : ""}
              required
              disabled={isPending}
            />
            {state.errors?.dueDate && (
              <div className="text-destructive text-sm">
                {state.errors.dueDate}
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
          <Button type="submit" form="quota-form" disabled={isPending}>
            {isPending
              ? translations.status.processing
              : quota
                ? translations.actions.update
                : translations.actions.create}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}