"use client";

import { useEffect, useActionState } from "react";
import { User } from "@/types/users.types";
import { updateUserAction, UserState } from "@/lib/actions/user-actions";
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

interface UserModalProps {
  user: User;
  isSelf: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserModal({
  user,
  isSelf,
  onClose,
  onSuccess,
}: UserModalProps) {
  const initialState: UserState = { message: null, errors: {} };
  const [state, formAction, isPending] = useActionState(
    updateUserAction,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      onSuccess();
      onClose();
    }
  }, [state, onClose, onSuccess]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{translations.titles.editUser}</DialogTitle>
        </DialogHeader>

        <form id="user-edit-form" action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={user.id} />

          {state.message && !state.success && (
            <div className="text-destructive text-sm">{state.message}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-user-email">Email</Label>
            <Input
              type="email"
              name="email"
              id="edit-user-email"
              defaultValue={user.email}
              required
              disabled={isPending}
            />
            {state.errors?.email && (
              <div className="text-destructive text-sm">
                {state.errors.email}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-user-name">{translations.labels.name}</Label>
            <Input
              type="text"
              name="name"
              id="edit-user-name"
              defaultValue={user.name || ""}
              placeholder={translations.placeholders.userName}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-user-role">{translations.labels.role}</Label>
            {isSelf ? (
              <>
                <input type="hidden" name="role" value={user.role} />
                <div className="border-input bg-muted text-muted-foreground flex h-9 w-full items-center rounded-md border px-3 text-sm">
                  {user.role === "admin"
                    ? translations.auth.admin
                    : translations.auth.treasurer}
                </div>
                <p className="text-muted-foreground text-xs">
                  {translations.errors.cannotChangeOwnRole}
                </p>
              </>
            ) : (
              <Select name="role" defaultValue={user.role} required>
                <SelectTrigger id="edit-user-role" className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    {translations.auth.admin}
                  </SelectItem>
                  <SelectItem value="treasurer">
                    {translations.auth.treasurer}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
            {state.errors?.role && (
              <div className="text-destructive text-sm">
                {state.errors.role}
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
          <Button type="submit" form="user-edit-form" disabled={isPending}>
            {isPending
              ? translations.status.processing
              : translations.actions.update}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
