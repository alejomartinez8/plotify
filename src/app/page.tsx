import { getLotsData, getContributions, getExpenses } from '@/lib/data'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function HomePage() {
  try {
    const [lots, contributions, expenses] = await Promise.all([
      getLotsData(),
      getContributions(),
      getExpenses()
    ])

    return (
      <DashboardClient 
        initialLots={lots}
        initialContributions={contributions}
        initialExpenses={expenses}
      />
    )
  } catch (error) {
    console.error('Error loading data:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Plotify</h1>
          <p className="text-gray-600">Error loading application data</p>
          <p className="text-sm text-red-600 mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    )
  }
}
