import { translations } from "@/lib/translations";

export default async function Header() {
  return (
    <div className="bg-card border-b shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div>
            <h1 className="text-foreground text-2xl font-bold">
              {translations.app.title}
            </h1>
            <p className="text-muted-foreground text-sm">
              {translations.app.subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
