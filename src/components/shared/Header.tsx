import { translations } from "@/lib/translations";

export default async function Header() {
  return (
    <div className="bg-white shadow-xs border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {translations.app.title}
            </h1>
            <p className="text-sm text-gray-500">{translations.app.subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
