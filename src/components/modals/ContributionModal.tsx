"use client";

import { useEffect, useActionState, useTransition, useState } from "react";
import { useReceiptUpload } from "@/hooks/useReceiptUpload";
import { Lot } from "@/types/lots.types";
import { Contribution, ContributionType } from "@/types/contributions.types";
import {
  createContributionAction,
  updateContributionAction,
  ContributionState,
} from "@/lib/actions/contribution-actions";
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

interface ContributionModalProps {
  contribution?: Contribution | null;
  onClose: () => void;
  onSuccess: (contribution: Contribution, isUpdate: boolean) => void;
  lots: Lot[];
  lotsLoading?: boolean;
  defaultLotId?: string;
}

export default function ContributionModal({
  onClose,
  contribution,
  onSuccess,
  lots,
  lotsLoading = false,
  defaultLotId,
}: ContributionModalProps) {
  const initialState: ContributionState = { message: null, errors: {} };
  const action = contribution
    ? updateContributionAction
    : createContributionAction;
  const [state, formAction] = useActionState(action, initialState);
  const [, startTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewFileName, setPreviewFileName] = useState<string | undefined>(
    contribution?.receiptFileName || undefined
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
      if (selectedFile || (contribution && contribution.receiptFileId)) {
        const selectedLot = lots.find(
          (lot) => lot.id === formData.get("lotId")
        );
        const additionalData: Record<string, string> = {
          fundType: formData.get("type") as string,
        };

        if (selectedLot) {
          additionalData.lotNumber = selectedLot.lotNumber;
        }

        await uploadReceipt({
          type: "income",
          formData,
          selectedFile,
          existingRecord: contribution,
          additionalData,
        });
      }

      startTransition(() => {
        const updatedContribution: Contribution = {
          id: contribution?.id || 0,
          lotId: formData.get("lotId") as string,
          type: formData.get("type") as ContributionType,
          amount: parseFloat(formData.get("amount") as string),
          date: formData.get("date") as string,
          description: formData.get("description") as string,
          receiptNumber: formData.get("receiptNumber") as string,
        };
        onSuccess(updatedContribution, !!contribution);
        formAction(formData);
      });
    } catch (error) {
      const errorInstance =
        error instanceof Error ? error : new Error(String(error));

      // Show error to user
      alert(`Error: ${errorInstance.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {contribution
              ? translations.titles.editContribution
              : translations.titles.registerContribution}
          </DialogTitle>
        </DialogHeader>

        <form
          id="contribution-form"
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

          {contribution && (
            <input type="hidden" name="id" value={contribution.id} />
          )}
          <div className="space-y-2">
            <Label htmlFor="lotId">{translations.labels.lot}</Label>
            <Select
              name="lotId"
              defaultValue={
                contribution?.lotId?.toString() || defaultLotId || ""
              }
              required
              disabled={lotsLoading || isSubmitting}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    lotsLoading
                      ? translations.status.loading
                      : translations.placeholders.selectLot
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {lots.map((lot) => (
                  <SelectItem key={lot.id} value={lot.id}>
                    {lot.lotNumber} - {lot.owner}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.lotId && (
              <div className="text-destructive text-sm">
                {state.errors.lotId}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">{translations.messages.fundType}</Label>
            <Select
              name="type"
              defaultValue={contribution?.type || "maintenance"}
              required
              disabled={isSubmitting}
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
              defaultValue={contribution?.amount || ""}
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
              defaultValue={
                contribution?.date
                  ? formatDateForStorage(contribution.date)
                  : ""
              }
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
              defaultValue={contribution?.description || ""}
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
            <Label htmlFor="receiptNumber">
              {translations.labels.receiptNumber}
            </Label>
            <Input
              type="text"
              name="receiptNumber"
              id="receiptNumber"
              defaultValue={contribution?.receiptNumber || ""}
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
            form="contribution-form"
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting || isUploading
              ? translations.status.processing
              : contribution
                ? translations.actions.update
                : translations.actions.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
