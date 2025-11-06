import { translations } from "@/lib/translations";
import { auth, getUserRole } from "@/lib/auth";
import UserMenu from "./UserMenu";

export default async function Header() {
  const session = await auth();
  const userRole = await getUserRole();

  return (
    <div className="bg-card border-b shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex-shrink min-w-0">
            <h1 className="text-foreground text-xl sm:text-2xl font-bold truncate">
              {translations.app.title}
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm truncate">
              {translations.app.subtitle}
            </p>
          </div>

          {session?.user && (
            <div className="flex-shrink-0 ml-4">
              <UserMenu user={session.user} userRole={userRole} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
