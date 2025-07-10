'use client';

import { formatCurrency } from '@/lib/utils';
import { FundBalance } from '@/types/common.types';

interface FinancialCardProps {
  title: string;
  balance: FundBalance;
  color: 'blue' | 'orange';
}

export default function FinancialCard({ title, balance, color }: FinancialCardProps) {
  const colorClasses = {
    blue: 'text-blue-600',
    orange: 'text-orange-600'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className={`text-lg font-semibold mb-4 ${colorClasses[color]}`}>
        {title}
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Income:</span>
          <span className="font-semibold text-green-600">
            {formatCurrency(balance.income)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Expenses:</span>
          <span className="font-semibold text-red-600">
            {formatCurrency(balance.expenses)}
          </span>
        </div>
        <div className="border-t pt-3">
          <div className="flex justify-between">
            <span className="text-gray-900 font-semibold">Balance:</span>
            <span className={`font-bold ${balance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(balance.balance)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
