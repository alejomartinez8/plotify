"use client";

import { Lot } from "@/types/lots.types";
import { Contribution, ContributionType } from "@/types/contributions.types";
import { useState } from "react";
import { months } from "@/lib/constants";
import { translations } from "@/lib/translations";

interface PaymentGridProps {
  title: string;
  lots: Lot[];
  contributions: Contribution[];
  type: ContributionType;
  headerColor: string;
  cellColor: string;
}

export default function PaymentGrid({
  title,
  lots,
  contributions,
  type,
  headerColor,
  cellColor,
}: PaymentGridProps) {
  const [selectedYear, setSelectedYear] = useState(2024);

  const getPaymentStatus = (lotId: string | number, month: string) => {
    return contributions.some(
      (c) => {
        const contributionDate = new Date(c.date);
        const contributionMonth = contributionDate.toLocaleString('en-US', { month: 'short' });
        const contributionYear = contributionDate.getFullYear();
        return (
          c.lotId === lotId &&
          contributionMonth === month &&
          contributionYear === selectedYear &&
          c.type === type
        );
      }
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {title} {selectedYear}
          </h3>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="border rounded-sm px-3 py-1"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className={headerColor}>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                {translations.grid.lotNo}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                {translations.grid.owner}
              </th>
              {months.map((month) => (
                <th
                  key={month}
                  className="px-3 py-3 text-center text-xs font-medium text-black uppercase tracking-wider"
                >
                  {month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lots.map((lot) => (
              <tr key={lot.id} className="hover:bg-gray-50">
                <td
                  className={`px-4 py-4 text-sm font-medium text-gray-900 ${cellColor}`}
                >
                  {lot.id}
                </td>
                <td className={`px-4 py-4 text-sm text-gray-900 ${cellColor}`}>
                  {lot.owner}
                </td>
                {months.map((month) => (
                  <td key={month} className="px-3 py-4 text-center">
                    {getPaymentStatus(lot.id, month) ? (
                      <div className="w-6 h-6 bg-green-500 rounded-sm mx-auto flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-gray-200 rounded-sm mx-auto"></div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
