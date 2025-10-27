import { translations } from "@/lib/translations";
import { isAuthenticated } from "@/lib/auth";
import { AuthButton } from "./AuthButton";

export default async function Header() {
  const isAdmin = await isAuthenticated();

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
          {isAdmin && (
            <div className="flex items-center space-x-4">
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                Admin
              </span>
              <AuthButton isAuthenticated={isAdmin} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
