'use client'

import { useState } from 'react'
import { ChevronDown, MoreVertical, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface Transaction {
  id: string
  clientName: string
  clientEmail: string
  clientAvatar?: string
  date: string
  serviceType: string
  styleName: string
  status: 'paid' | 'pending' | 'cancelled'
  amount: number
}

interface RecentTransactionsProps {
  className?: string
  transactions?: Transaction[]
  loading?: boolean
}

const defaultTransactions: Transaction[] = [
  {
    id: '1',
    clientName: 'Sarah Johnson',
    clientEmail: 'sarah.j@example.com',
    clientAvatar: '/avatars/sarah.jpg',
    date: '15 Dec 2024',
    serviceType: 'Box Braids',
    styleName: 'Medium Box Braids, Shoulder Length',
    status: 'paid',
    amount: 456.37
  },
  {
    id: '2',
    clientName: 'Maria Garcia',
    clientEmail: 'maria.g@example.com',
    clientAvatar: '/avatars/maria.jpg',
    date: '14 Dec 2024',
    serviceType: 'Knotless Braids',
    styleName: 'Small Knotless, Waist Length',
    status: 'cancelled',
    amount: 475.57
  },
  {
    id: '3',
    clientName: 'Ashley Williams',
    clientEmail: 'ashley.w@example.com',
    clientAvatar: '/avatars/ashley.jpg',
    date: '12 Dec 2024',
    serviceType: 'Cornrows',
    styleName: 'Feed-in Cornrows Design',
    status: 'paid',
    amount: 544.78
  },
  {
    id: '4',
    clientName: 'Jennifer Brown',
    clientEmail: 'jennifer.b@example.com',
    clientAvatar: '/avatars/jennifer.jpg',
    date: '10 Dec 2024',
    serviceType: 'Passion Twists',
    styleName: 'Medium Passion Twists, Mid-Back',
    status: 'pending',
    amount: 385.92
  },
  {
    id: '5',
    clientName: 'Nicole Davis',
    clientEmail: 'nicole.d@example.com',
    clientAvatar: '/avatars/nicole.jpg',
    date: '8 Dec 2024',
    serviceType: 'Micro Braids',
    styleName: 'Micro Braids, Shoulder Length',
    status: 'paid',
    amount: 625.45
  }
]

export function RecentTransactions({ 
  className, 
  transactions = defaultTransactions,
  loading = false 
}: RecentTransactionsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('month')

  if (loading) {
    return (
      <div className={cn("rounded-lg border border-gray-200 bg-white p-6", className)}>
        <div className="animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("rounded-lg border border-gray-200 bg-white", className)}>
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transaction History</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedPeriod('week')}
              className={cn(
                "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                selectedPeriod === 'week' 
                  ? "bg-gray-100 text-gray-900" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              This Week
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={cn(
                "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                selectedPeriod === 'month' 
                  ? "bg-gray-100 text-gray-900" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              This Month
            </button>
            <button className="ml-2 rounded-lg p-1 hover:bg-gray-100">
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Service Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Style Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      {transaction.clientAvatar ? (
                        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-600">
                          {transaction.clientName.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{transaction.clientName}</p>
                      <p className="text-xs text-gray-500">#{transaction.id.padStart(8, '0')}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {transaction.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.serviceType}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {transaction.styleName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn(
                    "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                    transaction.status === 'paid' && "bg-green-100 text-green-700",
                    transaction.status === 'pending' && "bg-yellow-100 text-yellow-700",
                    transaction.status === 'cancelled' && "bg-red-100 text-red-700"
                  )}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                  ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button className="text-gray-400 hover:text-gray-600">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}