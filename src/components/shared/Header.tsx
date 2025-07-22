import { translations } from "@/lib/translations";

export default async function Header() {
  return (
    <div className="bg-card shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {translations.app.title}
            </h1>
            <p className="text-sm text-muted-foreground">{translations.app.subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
