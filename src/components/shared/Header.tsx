'use client';

import { Plus } from 'lucide-react';

interface HeaderProps {
  onNewContribution: () => void;
  onNewExpense: () => void;
}

export default function Header({ onNewContribution, onNewExpense }: HeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Plotify</h1>
            <p className="text-sm text-gray-500">Collection Management System</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onNewContribution}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>New Contribution</span>
            </button>
            <button
              onClick={onNewExpense}
              className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-700"
            >
              <Plus className="w-4 h-4" />
              <span>New Expense</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
