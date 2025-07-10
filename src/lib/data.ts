export function getLotsData() {
  // Return static data to avoid file system issues during build
  return [
    { "id": 0, "owner": "JOHN DOE" },
    { "id": 3, "owner": "JANE SMITH" },
    { "id": 4, "owner": "MIKE JOHNSON" },
    { "id": 5, "owner": "SARAH WILSON" },
    { "id": 6, "owner": "DAVID BROWN" },
    { "id": 7, "owner": "LISA GARCIA" },
    { "id": 8, "owner": "ROBERT DAVIS" },
    { "id": 9, "owner": "MARIA RODRIGUEZ" },
    { "id": 10, "owner": "JAMES MILLER" },
    { "id": 11, "owner": "ANNA TAYLOR" },
    { "id": 12, "owner": "CARLOS ANDERSON" },
    { "id": 13, "owner": "EMMA THOMAS" },
    { "id": 14, "owner": "DANIEL JACKSON" },
    { "id": 15, "owner": "SOPHIA WHITE" },
    { "id": 16, "owner": "MATTHEW HARRIS" },
    { "id": 17, "owner": "OLIVIA MARTIN" },
    { "id": 18, "owner": "ANDREW THOMPSON" },
    { "id": 20, "owner": "ISABELLA GARCIA" },
    { "id": 21, "owner": "WILLIAM MARTINEZ" },
    { "id": 22, "owner": "CHARLOTTE ROBINSON" },
    { "id": 23, "owner": "BENJAMIN CLARK" },
    { "id": 24, "owner": "AMELIA RODRIGUEZ" },
    { "id": 25, "owner": "LUCAS LEWIS" },
    { "id": 26, "owner": "HARPER LEE" },
    { "id": 27, "owner": "HENRY WALKER" },
    { "id": 29, "owner": "EVELYN HALL" },
    { "id": 31, "owner": "SEBASTIAN ALLEN" },
    { "id": "E2-1", "owner": "NOAH/GRACE YOUNG" },
    { "id": "E2-2", "owner": "LIAM HERNANDEZ" },
    { "id": "E2-3", "owner": "AVA KING" },
    { "id": "E2-4", "owner": "MASON WRIGHT" },
    { "id": "E2-5", "owner": "MIA LOPEZ" },
    { "id": "E2-6", "owner": "ETHAN HILL" },
    { "id": "E2-7", "owner": "LUNA SCOTT" },
    { "id": "E2-8", "owner": "JACOB GREEN" }
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
      date: '2024-01-05',
      description: 'Basic maintenance fee'
    },
    {
      id: 2,
      lotId: 'E2-1',
      type: 'works' as const,
      amount: 500000,
      month: 'MAR',
      year: 2024,
      date: '2024-03-15',
      description: 'Street lighting installation'
    },
    {
      id: 3,
      lotId: '14',
      type: 'maintenance' as const,
      amount: 180000,
      month: 'APR',
      year: 2024,
      date: '2024-04-22',
      description: 'Garden maintenance and cleaning'
    },
    {
      id: 4,
      lotId: 'E2-3',
      type: 'works' as const,
      amount: 320000,
      month: 'MAY',
      year: 2024,
      date: '2024-05-10',
      description: 'Security gate installation'
    }
  ]
}

export async function getExpenses(): Promise<Expense[]> {
  // Mock data for server-side rendering
  return [
    {
      id: 1,
      type: 'maintenance' as const,
      amount: 120000,
      date: '2024-01-08',
      description: 'Landscaping and tree trimming',
      category: 'Gardening'
    },
    {
      id: 2,
      type: 'works' as const,
      amount: 450000,
      date: '2024-03-10',
      description: 'Playground equipment installation',
      category: 'Community'
    },
    {
      id: 3,
      type: 'maintenance' as const,
      amount: 180000,
      date: '2024-04-05',
      description: 'Water system maintenance',
      category: 'Infrastructure'
    },
    {
      id: 4,
      type: 'works' as const,
      amount: 320000,
      date: '2024-05-12',
      description: 'Street paving project',
      category: 'Infrastructure'
    }
  ]
}
