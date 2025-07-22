"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { Lot } from "@/types/lots.types";
import { Contribution } from "@/types/contributions.types";
import ContributionList from "@/components/shared/ContributionList";
import QuotaModal from "@/components/modals/QuotaModal";
import { translations } from "@/lib/translations";

interface MaintenanceViewProps {
  title: string;
  lots: Lot[];
  contributions: Contribution[];
  quotas: Array<{
    id: number;
    year: number;
    monthlyAmount: number;
  }>;
}

export default function MaintenanceView({
  title,
  lots,
  contributions,
  quotas,
}: MaintenanceViewProps) {
  const [showQuotaModal, setShowQuotaModal] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowQuotaModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>{translations.buttons.quotaConfiguration}</span>
          </button>
        </div>
      </div>
      <ContributionList
        title=""
        contributions={contributions.filter((c) => c.type === "maintenance")}
        lots={lots}
        color="blue"
      />
      {showQuotaModal && (
        <QuotaModal onClose={() => setShowQuotaModal(false)} quotas={quotas} />
      )}
    </div>
  );
}
