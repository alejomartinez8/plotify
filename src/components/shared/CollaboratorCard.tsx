"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Edit, Trash2, User, MapPin } from "lucide-react";
import { CollaboratorWithLots } from "@/types/collaborators.types";
import { Button } from "@/components/ui/Button";
import { translations } from "@/lib/translations";
import PhotoViewModal from "@/components/modals/PhotoViewModal";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import { deleteCollaboratorAction } from "@/lib/actions/collaborator-actions";
import { cn } from "@/lib/utils";

interface CollaboratorCardProps {
  collaborator: CollaboratorWithLots;
  onEdit: (collaborator: CollaboratorWithLots) => void;
  isAuthenticated?: boolean;
}

export default function CollaboratorCard({
  collaborator,
  onEdit,
  isAuthenticated = false,
}: CollaboratorCardProps) {
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    startTransition(async () => {
      await deleteCollaboratorAction(collaborator.id);
      setShowDeleteModal(false);
    });
  };

  return (
    <>
      <div className="group relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
        {/* Collaborator Photo */}
        <div className="mb-4 flex justify-center">
          {collaborator.photoFileUrl ? (
            <button
              onClick={() => setShowPhotoModal(true)}
              className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-primary/20 transition-all hover:border-primary/40 hover:scale-105"
              title={translations.labels.clickToEnlarge}
            >
              <Image
                src={collaborator.photoFileUrl}
                alt={`Photo of ${collaborator.name}`}
                width={128}
                height={128}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
            </button>
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted/50">
              <User className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}
        </div>

        {/* Collaborator Name */}
        <h3 className="mb-3 text-center text-xl font-semibold">
          {collaborator.name}
        </h3>

        {/* Assigned Lots */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{translations.labels.assignedLots}</span>
          </div>
          {collaborator.lotAssignments.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-2">
              {collaborator.lotAssignments.map((assignment) => (
                <span
                  key={assignment.lotId}
                  className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                >
                  {assignment.lotNumber} - {assignment.owner}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              {translations.labels.noLots}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {isAuthenticated && (
          <div className="mt-6 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(collaborator)}
              className="flex-1"
              disabled={isPending}
            >
              <Edit className="mr-2 h-4 w-4" />
              {translations.actions.edit}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="flex-1"
              disabled={isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {translations.actions.delete}
            </Button>
          </div>
        )}
      </div>

      {/* Photo View Modal */}
      {collaborator.photoFileUrl && (
        <PhotoViewModal
          isOpen={showPhotoModal}
          onClose={() => setShowPhotoModal(false)}
          photoUrl={collaborator.photoFileUrl}
          collaboratorName={collaborator.name}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isAuthenticated && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title={translations.confirmations.deleteTitle}
          message={translations.confirmations.deleteCollaborator}
          confirmText={translations.actions.delete}
          variant="danger"
          isLoading={isPending}
        />
      )}
    </>
  );
}
