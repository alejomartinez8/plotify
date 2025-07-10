'use client';

import { Users, DollarSign, Calendar } from 'lucide-react';
import { Lot } from '@/types/lots.types';
import { Contribution } from '@/types/contributions.types';
import { Expense } from '@/types/expenses.types';
import { getCurrentMonth } from '@/lib/utils';

interface QuickStatsProps {
  lots: Lot[];
  contributions: Contribution[];
  expenses: Expense[];
}

export default function QuickStats({ lots, contributions, expenses }: QuickStatsProps) {
  const currentMonth = getCurrentMonth();
  const currentMonthContributions = contributions.filter(c => c.month === currentMonth);
  const currentMonthExpenses = expenses.filter(e => 
    new Date(e.date).getMonth() === new Date().getMonth()
  );

  const stats = [
    {
      icon: Users,
      label: 'Total Lots',
      value: lots.length,
      color: 'text-blue-600'
    },
    {
      icon: DollarSign,
      label: 'Contributions This Month',
      value: currentMonthContributions.length,
      color: 'text-green-600'
    },
    {
      icon: Calendar,
      label: 'Expenses This Month',
      value: currentMonthExpenses.length,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <stat.icon className={`w-8 h-8 ${stat.color}`} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
