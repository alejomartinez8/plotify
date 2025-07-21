"use client";

import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { Lot } from "@/types/lots.types";
import { Contribution, ContributionType } from "@/types/contributions.types";
import PaymentGrid from "./PaymentGrid";
import ContributionListClient from "./ContributionListClient";
import { translations } from "@/lib/translations";

interface ContributionViewsProps {
  title: string;
  lots: Lot[];
  contributions: Contribution[];
  type: ContributionType;
  headerColor: string;
  cellColor: string;
  listColor: "blue" | "orange";
}

export default function ContributionViews({
  title,
  lots,
  contributions,
  type,
  headerColor,
  cellColor,
  listColor,
}: ContributionViewsProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* View Toggle */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === "grid"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>{translations.buttons.gridView}</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === "list"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <List className="w-4 h-4" />
            <span>{translations.buttons.listView}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === "grid" ? (
        <PaymentGrid
          title=""
          lots={lots}
          contributions={contributions}
          type={type}
          headerColor={headerColor}
          cellColor={cellColor}
        />
      ) : (
        <ContributionListClient
          title=""
          contributions={contributions.filter(c => c.type === type)}
          lots={lots}
          color={listColor}
        />
      )}
    </div>
  );
}