import { translations } from "@/lib/translations";
import { auth, getUserRole } from "@/lib/auth";
import { AuthButton } from "./AuthButton";
import Image from "next/image";

export default async function Header() {
  const session = await auth();
  const userRole = await getUserRole();

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

          {session?.user && (
            <div className="flex items-center gap-3">
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {session.user.name}
                  </span>
                  {userRole && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      userRole === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {userRole === 'admin' ? translations.auth.admin : translations.auth.owner}
                    </span>
                  )}
                </div>
                <span className="text-muted-foreground text-xs">
                  {session.user.email}
                </span>
              </div>
              <AuthButton />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
