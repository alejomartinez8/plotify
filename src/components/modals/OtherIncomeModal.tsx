"use client";

import {
  useEffect,
  useActionState,
  useTransition,
  useState,
  useRef,
} from "react";
import { Loader2 } from "lucide-react";
import { useReceiptUpload } from "@/hooks/useReceiptUpload";
import { OtherIncome } from "@/types/other-income.types";
import { ContributionType } from "@/types/contributions.types";
import {
  createOtherIncomeAction,
  updateOtherIncomeAction,
  OtherIncomeState,
} from "@/lib/actions/other-income-actions";
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
import { cn, formatDateForStorage } from "@/lib/utils";

interface OtherIncomeModalProps {
  otherIncome?: OtherIncome | null;
  onClose: () => void;
  onSuccess: (otherIncome: OtherIncome, isUpdate: boolean) => void;
}

export default function OtherIncomeModal({
  onClose,
  otherIncome,
  onSuccess,
}: OtherIncomeModalProps) {
  const initialState: OtherIncomeState = { message: null, errors: {} };
  const action = otherIncome
    ? updateOtherIncomeAction
    : createOtherIncomeAction;
  const [state, formAction] = useActionState(action, initialState);
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | undefined>(
    otherIncome?.receiptFileName || undefined
  );
  const { uploadReceipt, isUploading } = useReceiptUpload();
  const isLoading = isUploading || isPending || isSubmitting;
  const isLocked = otherIncome?.approvalStatus === "approved";

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state, onClose]);

  const handleSubmit = async (formData: FormData) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      if (selectedFile || (otherIncome && otherIncome.receiptFileId)) {
        await uploadReceipt({
          type: "otherIncome",
          formData,
          selectedFile,
          existingRecord: otherIncome,
        });
      }

      startTransition(() => {
        const updatedOtherIncome: OtherIncome = {
          id: otherIncome?.id || 0,
          type: (formData.get("type") as ContributionType) || "others",
          amount: parseFloat(formData.get("amount") as string),
          date: formData.get("date") as string,
          description: formData.get("description") as string,
          receiptNumber: formData.get("receiptNumber") as string,
          approvalStatus: otherIncome?.approvalStatus || "pending",
        };
        onSuccess(updatedOtherIncome, !!otherIncome);
        formAction(formData);
      });
    } catch (error) {
      submittingRef.current = false;
      setIsSubmitting(false);
      const errorInstance =
        error instanceof Error ? error : new Error(String(error));
      alert(`Error: ${errorInstance.message}`);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {otherIncome
              ? translations.titles.editOtherIncome
              : translations.titles.registerOtherIncome}
          </DialogTitle>
        </DialogHeader>

        <form
          id="other-income-form"
          action={handleSubmit}
          className="space-y-4"
        >
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

          {otherIncome && (
            <input type="hidden" name="id" value={otherIncome.id} />
          )}

          {isLocked && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              {translations.messages.approvedFieldsLockedInfo}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="type">{translations.messages.fundType}</Label>
            {isLocked ? (
              <>
                <input type="hidden" name="type" value={otherIncome!.type} />
                <div className="border-input bg-muted text-muted-foreground flex h-9 w-full items-center rounded-md border px-3 text-sm">
                  {translations.labels[otherIncome!.type]}
                </div>
              </>
            ) : (
              <Select
                name="type"
                defaultValue={otherIncome?.type || "maintenance"}
                required
                disabled={isLoading}
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
                  <SelectItem value="others">
                    {translations.labels.others}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
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
              defaultValue={otherIncome?.amount || ""}
              required
              min="0"
              step="1"
              disabled={isLoading}
              readOnly={isLocked}
              className={isLocked ? "bg-muted" : undefined}
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
              defaultValue={
                otherIncome?.date ? formatDateForStorage(otherIncome.date) : ""
              }
              required
              disabled={isLoading}
              readOnly={isLocked}
              className={isLocked ? "bg-muted" : undefined}
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
              defaultValue={otherIncome?.description || ""}
              placeholder={translations.placeholders.optionalDescription}
              disabled={isLoading}
            />
            {state.errors?.description && (
              <div className="text-destructive text-sm">
                {state.errors.description}
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
              defaultValue={otherIncome?.receiptNumber || ""}
              placeholder={translations.placeholders.receiptNumber}
              disabled={isLoading}
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
            disabled={isLoading}
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
            disabled={isLoading}
          >
            {translations.actions.cancel}
          </Button>
          <Button type="submit" form="other-income-form" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                {translations.status.processing}
              </>
            ) : otherIncome ? (
              translations.actions.update
            ) : (
              translations.actions.save
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
