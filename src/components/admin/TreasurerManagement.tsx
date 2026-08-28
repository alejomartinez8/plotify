"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Treasurer } from "@/types/treasurers.types";
import { translations } from "@/lib/translations";
import {
  createTreasurerAction,
  deleteTreasurerAction,
  TreasurerState,
} from "@/lib/actions/treasurer-actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import { cn } from "@/lib/utils";

interface TreasurerManagementProps {
  treasurers: Treasurer[];
}

export default function TreasurerManagement({
  treasurers,
}: TreasurerManagementProps) {
  const initialState: TreasurerState = { message: null, errors: {} };
  const [state, formAction] = useActionState(
    createTreasurerAction,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [deletingTreasurer, setDeletingTreasurer] =
    useState<Treasurer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  const handleDeleteConfirm = async () => {
    if (!deletingTreasurer) return;

    setIsDeleting(true);
    try {
      await deleteTreasurerAction(deletingTreasurer.id);
    } finally {
      setIsDeleting(false);
      setDeletingTreasurer(null);
    }
  };

  return (
    <div className="space-y-6">
      <form
        ref={formRef}
        action={formAction}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1 space-y-2">
          <Label htmlFor="treasurer-email">Email</Label>
          <Input
            type="email"
            name="email"
            id="treasurer-email"
            placeholder={translations.placeholders.treasurerEmail}
            required
          />
          {state.errors?.email && (
            <div className="text-destructive text-sm">
              {state.errors.email}
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="treasurer-name">{translations.labels.name}</Label>
          <Input
            type="text"
            name="name"
            id="treasurer-name"
            placeholder={translations.placeholders.treasurerName}
          />
        </div>
        <Button type="submit">
          <Plus className="h-4 w-4" />
          {translations.titles.addTreasurer}
        </Button>
      </form>

      {state.message && (
        <div
          className={cn(
            "text-sm",
            state.success ? "text-emerald-600" : "text-destructive"
          )}
        >
          {state.message}
        </div>
      )}

      <div className="divide-y rounded-md border">
        {treasurers.length === 0 ? (
          <div className="text-muted-foreground p-4 text-center text-sm">
            {translations.admin.treasurersEmptyState}
          </div>
        ) : (
          treasurers.map((treasurer) => (
            <div
              key={treasurer.id}
              className="flex items-center justify-between p-3"
            >
              <div>
                <div className="font-medium">{treasurer.email}</div>
                {treasurer.name && (
                  <div className="text-muted-foreground text-sm">
                    {treasurer.name}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeletingTreasurer(treasurer)}
                className="hover:bg-destructive/10 hover:text-destructive h-8 w-8 p-0"
                title={translations.actions.delete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      <ConfirmationModal
        isOpen={!!deletingTreasurer}
        title={translations.confirmations.deleteTitle}
        message={translations.confirmations.deleteTreasurer}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingTreasurer(null)}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
