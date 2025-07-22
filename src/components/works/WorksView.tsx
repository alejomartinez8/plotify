import { Lot } from "@/types/lots.types";
import { Contribution } from "@/types/contributions.types";
import ContributionList from "@/components/shared/ContributionList";

interface WorksViewProps {
  title: string;
  lots: Lot[];
  contributions: Contribution[];
}

export default function WorksView({
  title,
  lots,
  contributions,
}: WorksViewProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>
      <ContributionList
        title=""
        contributions={contributions.filter((c) => c.type === "works")}
        lots={lots}
        color="orange"
      />
    </div>
  );
}
