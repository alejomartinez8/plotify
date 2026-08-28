"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { User, UserRole } from "@/types/users.types";
import { translations } from "@/lib/translations";
import {
  createUserAction,
  deleteUserAction,
  UserState,
} from "@/lib/actions/user-actions";
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
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import { cn } from "@/lib/utils";

interface UserManagementProps {
  users: User[];
  currentUserEmail: string | null;
}

const ROLE_BADGE: Record<UserRole, { label: string; className: string }> = {
  admin: {
    label: translations.auth.admin,
    className: "bg-purple-100 text-purple-700",
  },
  treasurer: {
    label: translations.auth.treasurer,
    className: "bg-emerald-100 text-emerald-700",
  },
};

export default function UserManagement({
  users,
  currentUserEmail,
}: UserManagementProps) {
  const initialState: UserState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createUserAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;

    setIsDeleting(true);
    try {
      await deleteUserAction(deletingUser.id);
    } finally {
      setIsDeleting(false);
      setDeletingUser(null);
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
          <Label htmlFor="user-email">Email</Label>
          <Input
            type="email"
            name="email"
            id="user-email"
            placeholder={translations.placeholders.userEmail}
            required
          />
          {state.errors?.email && (
            <div className="text-destructive text-sm">
              {state.errors.email}
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="user-name">{translations.labels.name}</Label>
          <Input
            type="text"
            name="name"
            id="user-name"
            placeholder={translations.placeholders.userName}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="user-role">{translations.labels.role}</Label>
          <Select name="role" defaultValue="treasurer" required>
            <SelectTrigger id="user-role" className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">{translations.auth.admin}</SelectItem>
              <SelectItem value="treasurer">
                {translations.auth.treasurer}
              </SelectItem>
            </SelectContent>
          </Select>
          {state.errors?.role && (
            <div className="text-destructive text-sm">
              {state.errors.role}
            </div>
          )}
        </div>
        <Button type="submit">
          <Plus className="h-4 w-4" />
          {translations.titles.addUser}
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
        {users.length === 0 ? (
          <div className="text-muted-foreground p-4 text-center text-sm">
            {translations.admin.usersEmptyState}
          </div>
        ) : (
          users.map((user) => {
            const isSelf = user.email === currentUserEmail;
            const badge = ROLE_BADGE[user.role];
            return (
              <div
                key={user.id}
                className="flex items-center justify-between p-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{user.email}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        badge.className
                      )}
                    >
                      {badge.label}
                    </span>
                  </div>
                  {user.name && (
                    <div className="text-muted-foreground text-sm">
                      {user.name}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingUser(user)}
                  disabled={isSelf}
                  className="hover:bg-destructive/10 hover:text-destructive h-8 w-8 p-0"
                  title={
                    isSelf
                      ? translations.errors.cannotRemoveSelf
                      : translations.actions.delete
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })
        )}
      </div>

      <ConfirmationModal
        isOpen={!!deletingUser}
        title={translations.confirmations.deleteTitle}
        message={translations.confirmations.deleteUser}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingUser(null)}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
