import { getLots } from "@/lib/database/lots";
import LotList from "@/components/shared/LotList";

export default async function LotsPage() {
  const lots = await getLots();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <LotList lots={lots} />
    </div>
  );
}
