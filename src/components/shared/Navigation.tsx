"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TrendingUp,
  DollarSign,
  TrendingDown,
  Settings,
  Calculator,
} from "lucide-react";
import { translations } from "@/lib/translations";

interface NavigationProps {
  isAuthenticated?: boolean;
}

const navigationItems = [
  { href: "/", label: translations.navigation.home, icon: TrendingUp },
  {
    href: "/income",
    label: translations.navigation.income,
    icon: DollarSign,
  },
  {
    href: "/expenses",
    label: translations.navigation.expenses,
    icon: TrendingDown,
  },
  {
    href: "/quotas",
    label: "Cuotas",
    icon: Calculator,
  },
];

const adminNavigationItems = [
  {
    href: "/admin",
    label: translations.navigation.admin,
    icon: Settings,
  },
];

export default function Navigation({ isAuthenticated = false }: NavigationProps) {
  const pathname = usePathname();

  return (
    <div className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navigation - Always visible */}
        <nav className="flex justify-center space-x-6 sm:space-x-8">
          {navigationItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center space-y-1 border-b-2 px-2 py-3 text-xs font-medium sm:flex-row sm:space-x-2 sm:space-y-0 sm:px-1 sm:py-4 sm:text-sm ${
                  isActive
                    ? "border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                }`}
              >
                <Icon className="h-5 w-5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden text-xs">{label}</span>
              </Link>
            );
          })}
          {isAuthenticated && adminNavigationItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center space-y-1 border-b-2 px-2 py-3 text-xs font-medium sm:flex-row sm:space-x-2 sm:space-y-0 sm:px-1 sm:py-4 sm:text-sm ${
                  isActive
                    ? "border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                }`}
              >
                <Icon className="h-5 w-5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden text-xs">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
