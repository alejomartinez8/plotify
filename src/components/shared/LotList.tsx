"use client";

import { useState, useOptimistic, useTransition } from "react";
import { Edit, Trash2, Plus, User } from "lucide-react";
import { Lot } from "@/types/lots.types";
import LotModal from "@/components/modals/LotModal";
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

  const [optimisticLots, deleteOptimisticLot] = useOptimistic(
    lots,
    (state, lotId: string | number) => state.filter((lot) => lot.id !== lotId)
  );

  console.log({ isPending, optimisticLots, selectedLot });

  const handleEdit = (lot: Lot) => {
    setSelectedLot(lot);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedLot(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (lot: Lot) => {
    if (confirm(`Are you sure you want to delete lot ${lot.id}?`)) {
      setError(null);
      startTransition(async () => {
        deleteOptimisticLot(lot.id);
        const result = await deleteLotAction(lot.id.toString());
        if (result?.message && !result.message.includes("successfully")) {
          setError(result.message);
        }
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Lots</h2>
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            disabled={isPending}
          >
            <Plus className="w-4 h-4" />
            {translations.lotList.addLot}
          </button>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {translations.lotList.lotId}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {translations.lotList.owner}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {translations.lotList.actions}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {optimisticLots.map((lot) => (
              <tr key={lot.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {lot.id}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{lot.owner}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(lot)}
                      className="text-blue-600 hover:text-blue-900 p-1 disabled:opacity-50"
                      title="Edit lot"
                      disabled={isPending}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(lot)}
                      className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                      title="Delete lot"
                      disabled={isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {optimisticLots.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">{translations.lotList.noLotsFound}</p>
          </div>
        )}
      </div>
      <LotModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lot={selectedLot}
      />
    </div>
  );
}
