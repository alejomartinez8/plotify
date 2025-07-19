"use client";

import { useEffect, useActionState } from "react";
import { X } from "lucide-react";
import { Lot } from "@/types/lots.types";
import {
  createLotAction,
  updateLotAction,
  State,
} from "@/lib/actions/lot-actions";

interface LotModalProps {
  isOpen: boolean;
  onClose: () => void;
  lot?: Lot | null;
}

export default function LotModal({ isOpen, onClose, lot }: LotModalProps) {
  const initialState: State = { message: null, errors: {} };
  const action = lot ? updateLotAction : createLotAction;
  const [state, formAction] = useActionState(action, initialState);

  useEffect(() => {
    if (
      state?.message &&
      !state.message.includes("Failed") &&
      !state.message.includes("Error")
    ) {
      onClose();
    }
  }, [state, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {lot ? "Edit Lot" : "Add New Lot"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form action={formAction} className="space-y-4">
          {state.message && (
            <div className="text-red-500 text-sm mb-4">{state.message}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lot ID
            </label>
            <input
              type="text"
              name="id"
              defaultValue={lot?.id || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={!!lot}
              placeholder="e.g., 22, E2-1"
            />
            {state.errors?.id && (
              <div className="text-red-500 text-sm mt-1">{state.errors.id}</div>
            )}
            {lot && (
              <p className="text-xs text-gray-500 mt-1">
                Lot ID cannot be changed
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner Name
            </label>
            <input
              type="text"
              name="owner"
              defaultValue={lot?.owner || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="Enter owner name"
            />
            {state.errors?.owner && (
              <div className="text-red-500 text-sm mt-1">
                {state.errors.owner}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {lot ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
