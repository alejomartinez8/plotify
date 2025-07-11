"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, Calendar, Users, TrendingDown, Plus } from "lucide-react";
import ContributionModal from "../modals/ContributionModal";
import ExpenseModal from "../modals/ExpenseModal";
import { useState } from "react";
import { Contribution } from "@/types/contributions.types";
import { Expense } from "@/types/expenses.types";
import { Lot } from "@/types/lots.types";

const navigationItems = [
  { href: "/", label: "Dashboard", icon: TrendingUp },
  { href: "/maintenance", label: "Maintenance", icon: Calendar },
  { href: "/works", label: "Works", icon: Users },
  { href: "/expenses", label: "Expenses", icon: TrendingDown },
];

interface NavigationClientProps {
  lots: Lot[];
}

export default function NavigationClient({ lots }: NavigationClientProps) {
  const pathname = usePathname();
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const handleContributionSubmit = (contribution: Omit<Contribution, "id">) => {
    const newContribution: Contribution = {
      id: Date.now(),
      ...contribution,
    };
    // TODO: POST new contribution
  };

  const handleExpenseSubmit = (expense: Omit<Expense, "id">) => {
    const newExpense: Expense = {
      id: Date.now(),
      ...expense,
    };
    // TODO: POST new expense
  };

  return (
    <div className="bg-white border-b">
      <div className="flex justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8">
          {navigationItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || (pathname === "/dashboard" && href === "/");
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
        <div className="flex space-x-2 py-2">
          <button
            onClick={() => setShowContributionModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>New Contribution</span>
          </button>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-700"
          >
            <Plus className="w-4 h-4" />
            <span>New Expense</span>
          </button>
        </div>
      </div>
      {/* Modals */}
      <ContributionModal
        isOpen={showContributionModal}
        onClose={() => setShowContributionModal(false)}
        onSubmit={handleContributionSubmit}
        lots={lots}
      />

      <ExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSubmit={handleExpenseSubmit}
      />
    </div>
  );
}
