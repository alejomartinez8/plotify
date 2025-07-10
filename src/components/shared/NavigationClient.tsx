'use client'

import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'

export default function NavigationClient({ initialTab }: { initialTab: string }) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set(name, value)
    return params.toString()
  }

  return (
    <nav className="flex space-x-8">
      {['dashboard', 'mantenimiento', 'obras', 'gastos'].map((tab) => (
        <Link
          key={tab}
          href={`${pathname}?${createQueryString('tab', tab)}`}
          className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
            initialTab === tab
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </Link>
      ))}
    </nav>
  )
}
