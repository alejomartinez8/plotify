import { getLots } from "@/lib/database/lots";
import NavigationClient from "@/components/shared/NavigationClient";
import LotsList from "@/components/shared/LotsList";

export default async function LotsPage() {
  const lots = await getLots();

  return (
    <>
      <NavigationClient lots={lots} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LotsList lots={lots} />
      </div>
    </>
  );
}
