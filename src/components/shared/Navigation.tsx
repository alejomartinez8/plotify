"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, DollarSign, Users, TrendingDown, Menu } from "lucide-react";
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
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation */}
        <div className="flex justify-between">
          <nav className="hidden sm:flex space-x-8">
            {navigationItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
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
            <Menu className="w-5 h-5" />
          </Button>

          {/* Action Buttons - Hidden on mobile when menu is closed */}
          <div className="hidden sm:flex">
            <ActionButtons />
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200">
            <nav className="py-2">
              {navigationItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 py-3 px-4 text-sm font-medium ${
                      isActive
                        ? "bg-primary/10 text-primary border-r-2 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-gray-200 py-3 px-4">
              <ActionButtons />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}