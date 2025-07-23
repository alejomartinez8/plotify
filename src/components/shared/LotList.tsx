"use client";

import { useState, useOptimistic, useTransition } from "react";
import { Edit, Trash2, Plus, User } from "lucide-react";
import { Lot } from "@/types/lots.types";
import LotModal from "@/components/modals/LotModal";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { translations } from "@/lib/translations";
import { deleteLotAction } from "@/lib/actions/lot-actions";

interface LotListProps {
  lots: Lot[];
  isAuthenticated?: boolean;
}

export default function LotList({ lots, isAuthenticated = false }: LotListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [lotToDelete, setLotToDelete] = useState<Lot | null>(null);

  const [optimisticLots, updateOptimisticLots] = useOptimistic(
    lots,
    (
      state,
      action: {
        type: "delete" | "update" | "create";
        lot?: Lot;
        lotId?: string | number;
      }
    ) => {
      switch (action.type) {
        case "delete":
          return state.filter((lot) => lot.id !== action.lotId);
        case "update":
          return state.map((lot) =>
            lot.id === action.lot?.id ? { ...lot, ...action.lot } : lot
          );
        case "create":
          return action.lot ? [...state, action.lot] : state;
        default:
          return state;
      }
    }
  );

  const handleEdit = (lot: Lot) => {
    setSelectedLot(lot);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedLot(null);
    setIsModalOpen(true);
  };

  const handleDelete = (lot: Lot) => {
    setLotToDelete(lot);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!lotToDelete) return;

    setError(null);
    setIsConfirmModalOpen(false);

    startTransition(async () => {
      updateOptimisticLots({ type: "delete", lotId: lotToDelete.id });
      const result = await deleteLotAction(lotToDelete.id.toString());
      if (result?.message && !result.message.includes("successfully")) {
        setError(result.message);
      }
    });

    setLotToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
    setLotToDelete(null);
  };

  const handleLotSuccess = (updatedLot: Lot, isUpdate: boolean) => {
    if (isUpdate) {
      updateOptimisticLots({ type: "update", lot: updatedLot });
    } else {
      updateOptimisticLots({ type: "create", lot: updatedLot });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">{translations.navigation.lots}</h1>
          {isAuthenticated && (
            <Button onClick={handleAdd} disabled={isPending}>
              <Plus className="h-4 w-4" />
              {translations.titles.newLot}
            </Button>
          )}
        </div>
        {error && (
          <div className="bg-destructive/10 border-destructive/20 text-destructive mt-4 rounded border px-4 py-3">
            {error}
          </div>
        )}
      </div>

      {/* Lots Card */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                    {translations.labels.lot}
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                    {translations.labels.owner}
                  </th>
                  {isAuthenticated && (
                    <th className="text-muted-foreground px-6 py-3 text-right text-xs font-medium tracking-wider uppercase">
                      {translations.labels.actions}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {optimisticLots.map((lot) => (
                  <tr key={lot.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-primary/10 mr-3 flex h-8 w-8 items-center justify-center rounded-full">
                          <User className="text-primary h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">
                          {lot.lotNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm">{lot.owner}</span>
                    </td>
                    {isAuthenticated && (
                      <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(lot)}
                            title="Edit lot"
                            disabled={isPending}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(lot)}
                            title="Delete lot"
                            disabled={isPending}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {optimisticLots.length === 0 && (
              <div className="py-12 text-center">
                <div className="text-muted-foreground mb-4 text-6xl">🏠</div>
                <p className="text-muted-foreground">
                  {translations.messages.noLots}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isModalOpen && isAuthenticated && (
        <LotModal
          onClose={() => setIsModalOpen(false)}
          lot={selectedLot}
          onSuccess={handleLotSuccess}
        />
      )}

      {isAuthenticated && (
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title={translations.confirmations.deleteTitle}
          message={translations.confirmations.deleteLot}
          variant="danger"
          isLoading={isPending}
        />
      )}
    </div>
  );
}
