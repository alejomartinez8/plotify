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
}

export default function LotList({ lots }: LotListProps) {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-bold">{translations.navigation.lots}</h1>
          <Button onClick={handleAdd} disabled={isPending}>
            <Plus className="w-4 h-4" />
            {translations.titles.newLot}
          </Button>
        </div>
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded mt-4">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {translations.labels.lot}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {translations.labels.owner}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {translations.labels.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {optimisticLots.map((lot) => (
                  <tr key={lot.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">
                          {lot.lotNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm">{lot.owner}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(lot)}
                          title="Edit lot"
                          disabled={isPending}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(lot)}
                          title="Delete lot"
                          disabled={isPending}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {optimisticLots.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground text-6xl mb-4">🏠</div>
                <p className="text-muted-foreground">
                  {translations.messages.noLots}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isModalOpen && (
        <LotModal
          onClose={() => setIsModalOpen(false)}
          lot={selectedLot}
          onSuccess={handleLotSuccess}
        />
      )}

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={translations.confirmations.deleteTitle}
        message={translations.confirmations.deleteLot}
        variant="danger"
        isLoading={isPending}
      />
    </div>
  );
}
