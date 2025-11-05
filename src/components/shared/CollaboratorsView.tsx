"use client";

import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { CollaboratorWithLots } from "@/types/collaborators.types";
import { Lot } from "@/types/lots.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import CollaboratorCard from "@/components/shared/CollaboratorCard";
import CollaboratorModal from "@/components/modals/CollaboratorModal";
import { translations } from "@/lib/translations";

interface CollaboratorsViewProps {
  collaborators: CollaboratorWithLots[];
  lots: Lot[];
  userRole?: "admin" | "owner" | null;
  userLotIds?: string[];
}

export default function CollaboratorsView({
  collaborators,
  lots,
  userRole = null,
  userLotIds = [],
}: CollaboratorsViewProps) {
  const isAuthenticated = !!userRole;
  const [showModal, setShowModal] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<CollaboratorWithLots | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLotFilter, setSelectedLotFilter] = useState<string>("all");

  // Filter and search collaborators
  const filteredCollaborators = useMemo(() => {
    return collaborators.filter((collaborator) => {
      // Search filter
      const matchesSearch = collaborator.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // Lot filter
      const matchesLot =
        selectedLotFilter === "all" ||
        collaborator.lotAssignments.some(
          (assignment) => assignment.lotId === selectedLotFilter
        );

      return matchesSearch && matchesLot;
    });
  }, [collaborators, searchQuery, selectedLotFilter]);

  const handleNewCollaborator = () => {
    setSelectedCollaborator(null);
    setShowModal(true);
  };

  const handleEditCollaborator = (collaborator: CollaboratorWithLots) => {
    setSelectedCollaborator(collaborator);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCollaborator(null);
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {translations.titles.collaborators}
          </h1>
          <p className="text-muted-foreground">
            {filteredCollaborators.length} {translations.labels.collaborators.toLowerCase()}
          </p>
        </div>
        {isAuthenticated && (
          <Button onClick={handleNewCollaborator}>
            <Plus className="mr-2 h-4 w-4" />
            {translations.titles.newCollaborator}
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={translations.placeholders.searchCollaborators}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Lot Filter */}
        <Select value={selectedLotFilter} onValueChange={setSelectedLotFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={translations.filters.allLots} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{translations.filters.allLots}</SelectItem>
            {lots.map((lot) => (
              <SelectItem key={lot.id} value={lot.id}>
                {lot.lotNumber} - {lot.owner}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Collaborators Grid */}
      {filteredCollaborators.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCollaborators.map((collaborator) => {
            // Check if user can edit this collaborator
            // Admin can edit all, owner can edit if collaborator is assigned to at least one of their lots
            const canEdit = userRole === "admin" ||
              (userRole === "owner" && collaborator.lotAssignments.some(
                (assignment) => userLotIds.includes(assignment.lotId)
              ));

            return (
              <CollaboratorCard
                key={collaborator.id}
                collaborator={collaborator}
                onEdit={handleEditCollaborator}
                canEdit={canEdit}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">
              {searchQuery || selectedLotFilter !== "all"
                ? translations.messages.noResults
                : translations.messages.noCollaborators}
            </h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              {searchQuery || selectedLotFilter !== "all"
                ? translations.messages.tryChangingFilters
                : translations.messages.getStartedCollaborators}
            </p>
            {isAuthenticated && !searchQuery && selectedLotFilter === "all" && (
              <Button onClick={handleNewCollaborator}>
                <Plus className="mr-2 h-4 w-4" />
                {translations.titles.newCollaborator}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Collaborator Modal */}
      {isAuthenticated && showModal && (
        <CollaboratorModal
          collaborator={selectedCollaborator}
          onClose={handleCloseModal}
          lots={lots}
        />
      )}
    </div>
  );
}
