import { translations } from "@/lib/translations";
import { Button } from "@/components/ui/Button";
import { signOut } from "@/lib/auth";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 sm:p-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-red-100 p-4 rounded-full">
            <ShieldX className="h-12 w-12 text-red-600" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {translations.errors.unauthorized}
          </h1>

          <p className="text-sm sm:text-base text-gray-600">
            {translations.errors.noLotAssigned}
          </p>

          <p className="text-xs sm:text-sm text-gray-500">
            {translations.errors.contactAdmin}
          </p>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
            className="w-full pt-4"
          >
            <Button type="submit" className="w-full">
              {translations.auth.logout}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
