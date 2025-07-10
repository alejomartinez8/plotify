'use client'

import { useState } from 'react'
import Header from '@/components/shared/Header'
import Navigation from '@/components/shared/Navigation'
import FinancialCard from '@/components/dashboard/FinancialCard'
import QuickStats from '@/components/dashboard/QuickStats'
import PaymentGrid from '@/components/dashboard/PaymentGrid'
import ExpenseList from '@/components/dashboard/ExpenseList'
import ContributionModal from '@/components/modals/ContributionModal'
import ExpenseModal from '@/components/modals/ExpenseModal'
import { Lot } from '@/types/lots.types';
import { Contribution } from '@/types/contributions.types';
import { Expense } from '@/types/expenses.types';
import { TabType, FundBalance } from '@/types/common.types';

interface DashboardClientProps {
  initialLots: Lot[]
  initialContributions: Contribution[]
  initialExpenses: Expense[]
}

export default function DashboardClient({
  initialLots,
  initialContributions,
  initialExpenses
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [lots] = useState<Lot[]>(initialLots)
  const [contributions, setContributions] = useState<Contribution[]>(initialContributions)
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [selectedYear, setSelectedYear] = useState(2024)
  const [showContributionModal, setShowContributionModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)

  // Calculate fund balances
  const calculateBalance = (type: 'maintenance' | 'works'): FundBalance => {
    const income = contributions
      .filter(c => c.type === type)
      .reduce((sum, c) => sum + c.amount, 0)
    
    const expenseTotal = expenses
      .filter(e => e.type === type)
      .reduce((sum, e) => sum + e.amount, 0)
    
    return { income, expenses: expenseTotal, balance: income - expenseTotal }
  }

  const handleContributionSubmit = (contribution: Omit<Contribution, 'id'>) => {
    const newContribution: Contribution = {
      id: Date.now(),
      ...contribution
    }
    setContributions(prev => [...prev, newContribution])
  }

  const handleExpenseSubmit = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      id: Date.now(),
      ...expense
    }
    setExpenses(prev => [...prev, newExpense])
  }

  const maintenanceBalance = calculateBalance('maintenance')
  const worksBalance = calculateBalance('works')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onNewContribution={() => setShowContributionModal(true)}
        onNewExpense={() => setShowExpenseModal(true)}
      />
      
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FinancialCard
                title="Maintenance Fund"
                balance={maintenanceBalance}
                color="blue"
              />
              <FinancialCard
                title="Works Fund"
                balance={worksBalance}
                color="orange"
              />
            </div>

            {/* Quick Stats */}
            <QuickStats
              lots={lots}
              contributions={contributions}
              expenses={expenses}
            />
          </div>
        )}

        {/* Maintenance Tracking */}
        {activeTab === 'maintenance' && (
          <PaymentGrid
            title="Maintenance Contributions"
            lots={lots}
            contributions={contributions}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            type="maintenance"
            headerColor="bg-yellow-400"
            cellColor="bg-blue-100"
          />
        )}

        {/* Works Tracking */}
        {activeTab === 'works' && (
          <PaymentGrid
            title="Works Contributions"
            lots={lots}
            contributions={contributions}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            type="works"
            headerColor="bg-orange-400"
            cellColor="bg-orange-100"
          />
        )}

        {/* Expenses */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ExpenseList
                title="Maintenance Expenses"
                expenses={expenses}
                type="maintenance"
                color="blue"
              />
              <ExpenseList
                title="Works Expenses"
                expenses={expenses}
                type="works"
                color="orange"
              />
            </div>
          </div>
        )}
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
  )
}
