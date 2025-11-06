"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { LogOut, ChevronDown } from "lucide-react";
import { translations } from "@/lib/translations";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  userRole: "admin" | "owner" | null;
}

export default function UserMenu({ user, userRole }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirectTo: "/login" });
  };

  // Get user initials for fallback avatar
  const getInitials = () => {
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Desktop view - full info */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden sm:flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || "User"}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
            {getInitials()}
          </div>
        )}
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{user.name}</span>
            {userRole && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  userRole === "admin"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {userRole === "admin"
                  ? translations.auth.admin
                  : translations.auth.owner}
              </span>
            )}
          </div>
          <span className="text-muted-foreground text-xs">{user.email}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Mobile view - just avatar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="sm:hidden flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1.5 transition-colors"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || "User"}
            width={36}
            height={36}
            className="rounded-full"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-xs">
            {getInitials()}
          </div>
        )}
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* Mobile: Show user info in dropdown */}
          <div className="sm:hidden px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">{user.name}</span>
              {userRole && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    userRole === "admin"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {userRole === "admin"
                    ? translations.auth.admin
                    : translations.auth.owner}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">{user.email}</span>
          </div>

          {/* Logout button */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {translations.auth.logout}
          </button>
        </div>
      )}
    </div>
  );
}
