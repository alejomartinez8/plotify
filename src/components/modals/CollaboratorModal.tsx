"use client";

import { useActionState, useState, FormEvent, useEffect } from "react";
import { Lot } from "@/types/lots.types";
import { CollaboratorWithLots } from "@/types/collaborators.types";
import {
  createCollaboratorAction,
  updateCollaboratorAction,
  CollaboratorState,
} from "@/lib/actions/collaborator-actions";
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
import { Checkbox } from "@/components/ui/Checkbox";
import { cn } from "@/lib/utils";

interface CollaboratorModalProps {
  collaborator?: CollaboratorWithLots | null;
  onClose: () => void;
  lots: Lot[];
  lotsLoading?: boolean;
}

export default function CollaboratorModal({
  onClose,
  collaborator,
  lots,
  lotsLoading = false,
}: CollaboratorModalProps) {
  const initialState: CollaboratorState = { message: null, errors: {} };
  const action = collaborator ? updateCollaboratorAction : createCollaboratorAction;
  const [state, formAction] = useActionState(action, initialState);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewFileName, setPreviewFileName] = useState<string | undefined>(
    collaborator?.photoFileName || undefined
  );
  const [selectedLots, setSelectedLots] = useState<Set<string>>(
    new Set(collaborator?.lotAssignments.map((a) => a.lotId) || [])
  );

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state, onClose]);

  const handleLotToggle = (lotId: string) => {
    const newSelection = new Set(selectedLots);
    if (newSelection.has(lotId)) {
      newSelection.delete(lotId);
    } else {
      newSelection.add(lotId);
    }
    setSelectedLots(newSelection);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const name = formData.get("name") as string;

    let photoFileId = collaborator?.photoFileId || null;
    let photoFileUrl = collaborator?.photoFileUrl || null;
    let photoFileName = collaborator?.photoFileName || null;

    try {
      // Upload file if selected
      if (selectedFile) {
        setIsUploading(true);

        const uploadFormData = new FormData();
        uploadFormData.append("file", selectedFile);
        uploadFormData.append("type", "collaborator");
        uploadFormData.append("collaboratorName", name);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const errorDetails = await uploadResponse.json();
          throw new Error(
            errorDetails.details ||
              errorDetails.error ||
              "Failed to upload photo"
          );
        }

        const uploadResult = await uploadResponse.json();
        const fileData = uploadResult.file;

        photoFileId = fileData.id;
        photoFileUrl = fileData.url;
        photoFileName = fileData.name;

        setIsUploading(false);
      }

      // Create new FormData with photo info
      const actionFormData = new FormData(formElement);
      if (collaborator) {
        actionFormData.set("id", collaborator.id);
      }
      actionFormData.set("photoFileId", photoFileId || "");
      actionFormData.set("photoFileUrl", photoFileUrl || "");
      actionFormData.set("photoFileName", photoFileName || "");
      actionFormData.set("lotIds", JSON.stringify(Array.from(selectedLots)));

      // Call the action
      formAction(actionFormData);
    } catch (error) {
      const errorInstance =
        error instanceof Error ? error : new Error(String(error));
      setIsUploading(false);
      // Error will be shown via state.message
    }
  };

  const isSubmitting = isUploading;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {collaborator
              ? translations.titles.editCollaborator
              : translations.titles.registerCollaborator}
          </DialogTitle>
        </DialogHeader>

        <form
          id="collaborator-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {state.message && (
            <div
              className={cn(
                "mb-4 text-sm",
                state.success ? "text-emerald-600" : "text-destructive"
              )}
            >
              {state.message}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">{translations.labels.name}</Label>
            <Input
              type="text"
              name="name"
              id="name"
              defaultValue={collaborator?.name || ""}
              placeholder={translations.placeholders.collaboratorName}
              required
              disabled={isSubmitting}
            />
            {state.errors?.name && (
              <div className="text-destructive text-sm">
                {state.errors.name}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>{translations.labels.photo}</Label>
            <FileUpload
              onFileSelect={setSelectedFile}
              value={selectedFile}
              disabled={isSubmitting}
              showPreview={true}
              previewFileName={previewFileName}
              onRemovePreview={() => setPreviewFileName(undefined)}
              accept="image/jpeg,image/png,image/webp"
            />
            {state.errors?.photoFileId && (
              <div className="text-destructive text-sm">
                {state.errors.photoFileId}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>{translations.labels.assignedLots}</Label>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-4">
              {lotsLoading ? (
                <p className="text-sm text-muted-foreground">
                  {translations.status.loading}
                </p>
              ) : lots.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {translations.messages.noLots}
                </p>
              ) : (
                lots.map((lot) => (
                  <div key={lot.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`lot-${lot.id}`}
                      checked={selectedLots.has(lot.id)}
                      onCheckedChange={() => handleLotToggle(lot.id)}
                      disabled={isSubmitting}
                    />
                    <label
                      htmlFor={`lot-${lot.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {lot.lotNumber} - {lot.owner}
                    </label>
                  </div>
                ))
              )}
            </div>
            {selectedLots.size === 0 && (
              <p className="text-sm text-muted-foreground">
                {translations.labels.noLots}
              </p>
            )}
            {state.errors?.lotIds && (
              <div className="text-destructive text-sm">
                {state.errors.lotIds}
              </div>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {translations.actions.cancel}
          </Button>
          <Button
            type="submit"
            form="collaborator-form"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? translations.status.processing
              : collaborator
                ? translations.actions.update
                : translations.actions.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
