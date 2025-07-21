"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, Calendar, Users, TrendingDown } from "lucide-react";
import { translations } from "@/lib/translations";
import ActionButtons from "./ActionButtons";

const navigationItems = [
  { href: "/", label: translations.navigation.dashboard, icon: TrendingUp },
  {
    href: "/maintenance",
    label: translations.navigation.maintenance,
    icon: Calendar,
  },
  { href: "/works", label: translations.navigation.works, icon: Users },
  {
    href: "/expenses",
    label: translations.navigation.expenses,
    icon: TrendingDown,
  },
  {
    href: "/lots",
    label: translations.navigation.lots,
    icon: Users,
  },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <div className="bg-white border-b">
      <div className="flex justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8">
          {navigationItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (pathname === "/dashboard" && href === "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <ActionButtons />
      </div>
    </div>
  );
}