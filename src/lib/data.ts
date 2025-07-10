export function getLotsData() {
  // Return static data to avoid file system issues during build
  return [
    { "id": 0, "owner": "JUDITH" },
    { "id": 3, "owner": "JAMER" },
    { "id": 4, "owner": "ALEXANDER" },
    { "id": 5, "owner": "EDISSON" },
    { "id": 6, "owner": "MARIBEL VALDEZ" },
    { "id": 7, "owner": "JORGE GOMEZ" },
    { "id": 8, "owner": "SERGIO QUINTERO" },
    { "id": 9, "owner": "KELLY QUINTERO" },
    { "id": 10, "owner": "ALEX" },
    { "id": 11, "owner": "SERGIO ROLDAN" },
    { "id": 12, "owner": "ADRIANA VILLADA" },
    { "id": 13, "owner": "MIRYAM" },
    { "id": 14, "owner": "STYLACHO" },
    { "id": 15, "owner": "DARLY" },
    { "id": 16, "owner": "LUISA OLARTE" },
    { "id": 17, "owner": "GLORIA" },
    { "id": 18, "owner": "JUAN ALEJANDRO" },
    { "id": 20, "owner": "JUAN OLARTE" },
    { "id": 21, "owner": "KEVIN" },
    { "id": 22, "owner": "ALEJANDRO MARTINEZ" },
    { "id": 23, "owner": "JESSICA" },
    { "id": 24, "owner": "DIANA" },
    { "id": 25, "owner": "WILMAR" },
    { "id": 26, "owner": "MILENA" },
    { "id": 27, "owner": "AGUSTIN" },
    { "id": 29, "owner": "LUIS CARVAJAL" },
    { "id": 31, "owner": "YESICA" },
    { "id": "E2-1", "owner": "RICARDO/LILIANA" },
    { "id": "E2-2", "owner": "CAMILA" },
    { "id": "E2-3", "owner": "EDGAR" },
    { "id": "E2-4", "owner": "LEIDY" },
    { "id": "E2-5", "owner": "LEWIS" },
    { "id": "E2-6", "owner": "EDISON" },
    { "id": "E2-7", "owner": "JORGE" },
    { "id": "E2-8", "owner": "MONICA RAMIREZ" }
  ]
}

export function getMonthsData() {
  return ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
}

import type { Contribution } from '@/types/contributions.types'
import type { Expense } from '@/types/expenses.types'

export async function getContributions(): Promise<Contribution[]> {
  // Mock data for server-side rendering
  return [
    {
      id: 1,
      lotId: '22',
      type: 'maintenance' as const,
      amount: 150000,
      month: 'JAN',
      year: 2024,
      date: '2024-01-15',
      description: 'Monthly maintenance payment'
    },
    {
      id: 2,
      lotId: 'E2-1',
      type: 'works' as const,
      amount: 300000,
      month: 'FEB',
      year: 2024,
      date: '2024-02-20',
      description: 'Contribution for new entrance'
    }
  ]
}

export async function getExpenses(): Promise<Expense[]> {
  // Mock data for server-side rendering
  return [
    {
      id: 1,
      type: 'maintenance' as const,
      amount: 80000,
      date: '2024-01-10',
      description: 'Garden maintenance',
      category: 'Gardening'
    },
    {
      id: 2,
      type: 'works' as const,
      amount: 250000,
      date: '2024-02-15',
      description: 'Security gate repair',
      category: 'Security'
    }
  ]
}
