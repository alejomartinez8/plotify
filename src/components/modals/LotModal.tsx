"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Lot } from "@/types/lots.types";

interface LotModalProps {
  isOpen: boolean;
  onClose: () => void;
  lot?: Lot | null;
}

export default function LotModal({ isOpen, onClose, lot }: LotModalProps) {
  const [formData, setFormData] = useState({
    id: "",
    owner: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (lot) {
      setFormData({
        id: lot.id.toString(),
        owner: lot.owner,
      });
    } else {
      setFormData({
        id: "",
        owner: "",
      });
    }
  }, [lot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = lot ? `/api/lots/${lot.id}` : "/api/lots";
      const method = lot ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onClose();
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.message || "Error saving lot");
      }
    } catch (error) {
      console.error("Error saving lot:", error);
      alert("Error saving lot");
    } finally {
      setIsLoading(false);
    }
  };

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lot ID
            </label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={!!lot}
              placeholder="e.g., 22, E2-1"
            />
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
              value={formData.owner}
              onChange={(e) =>
                setFormData({ ...formData, owner: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="Enter owner name"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : lot ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
