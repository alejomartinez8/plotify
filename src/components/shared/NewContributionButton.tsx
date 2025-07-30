"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import ContributionModal from "../modals/ContributionModal";
import Spinner from "../ui/Spinner";
import { Button } from "@/components/ui/button";
import { Lot } from "@/types/lots.types";
import { translations } from "@/lib/translations";

interface NewContributionButtonProps {
  isAuthenticated?: boolean;
  lots?: Lot[];
}

export default function NewContributionButton({ 
  isAuthenticated = false,
  lots: propLots = []
}: NewContributionButtonProps) {
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [lots, setLots] = useState<Lot[]>(propLots);
  const [lotsLoading, setLotsLoading] = useState(false);

  const handleContributionSuccess = () => {
    // The server action handles the database update and revalidation
    setShowContributionModal(false);
  };

  const loadLots = async () => {
    if (lots.length > 0) return;

    setLotsLoading(true);
    try {
      const { getLotsAction } = await import("@/lib/actions/lot-actions");
      const data = await getLotsAction();
      setLots(data);
    } catch (error) {
      console.error("Error loading lots:", error);
      setLots([]);
    } finally {
      setLotsLoading(false);
    }
  };

  const handleOpenContributionModal = async () => {
    await loadLots();
    setShowContributionModal(true);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Button
        onClick={handleOpenContributionModal}
        disabled={lotsLoading}
        variant="default"
        size="sm"
      >
        {lotsLoading ? <Spinner size="sm" /> : <Plus className="h-4 w-4" />}
        <span>{translations.titles.newContribution}</span>
      </Button>

      {/* Modal */}
      {showContributionModal && (
        <ContributionModal
          onClose={() => setShowContributionModal(false)}
          onSuccess={handleContributionSuccess}
          lots={lots}
          lotsLoading={lotsLoading}
        />
      )}
    </>
  );
}