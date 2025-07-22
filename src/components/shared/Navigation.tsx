"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TrendingUp,
  DollarSign,
  Users,
  TrendingDown,
  Menu,
} from "lucide-react";
import { translations } from "@/lib/translations";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ActionButtons from "./ActionButtons";

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
    href: "/lots",
    label: translations.navigation.lots,
    icon: Users,
  },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation */}
        <div className="flex justify-between">
          <nav className="hidden space-x-8 sm:flex">
            {navigationItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center space-x-2 border-b-2 px-1 py-4 text-sm font-medium ${
                    isActive
                      ? "border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground border-transparent"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Action Buttons - Hidden on mobile when menu is closed */}
          <div className="hidden sm:flex">
            <ActionButtons />
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-gray-200 sm:hidden">
            <nav className="py-2">
              {navigationItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium ${
                      isActive
                        ? "bg-primary/10 text-primary border-primary border-r-2"
                        : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-gray-200 px-4 py-3">
              <ActionButtons />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
