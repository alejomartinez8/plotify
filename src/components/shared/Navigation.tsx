'use client';

import { TrendingUp, Calendar, Users, TrendingDown } from 'lucide-react';
import { TabType } from '@/types/common.types';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const navigationItems = [
  { id: 'dashboard' as TabType, label: 'Dashboard', icon: TrendingUp },
  { id: 'maintenance' as TabType, label: 'Maintenance', icon: Calendar },
  { id: 'works' as TabType, label: 'Works', icon: Users },
  { id: 'expenses' as TabType, label: 'Expenses', icon: TrendingDown }
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8">
          {navigationItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
