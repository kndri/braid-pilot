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
      <div className={cn("bg-white", className)}>
        <div className="animate-pulse p-5">
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
    <div className={cn("bg-white", className)}>
      {/* Header */}
      <div className="px-5 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Recent Transactions</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedPeriod('week')}
              className={cn(
                "px-2 py-0.5 text-xs font-medium rounded transition-colors",
                selectedPeriod === 'week' 
                  ? "bg-gray-100 text-gray-900" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Week
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={cn(
                "px-2 py-0.5 text-xs font-medium rounded transition-colors",
                selectedPeriod === 'month' 
                  ? "bg-gray-100 text-gray-900" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                Client
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                Date
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                Service
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                Style
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                Status
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-600">
                Amount
              </th>
              <th className="px-2 py-2 text-right text-xs font-medium text-gray-600">
                
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                        {transaction.clientName.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    <div className="ml-2">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{transaction.clientName}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                  {transaction.date}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                  {transaction.serviceType}
                </td>
                <td className="px-3 py-2 text-xs text-gray-600 truncate max-w-[150px]">
                  {transaction.styleName}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                    transaction.status === 'paid' && "bg-green-50 text-green-700",
                    transaction.status === 'pending' && "bg-yellow-50 text-yellow-700",
                    transaction.status === 'cancelled' && "bg-red-50 text-red-700"
                  )}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-right text-xs font-semibold text-gray-900">
                  ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-right text-xs">
                  <button className="text-gray-400 hover:text-gray-600 p-1">
                    <ExternalLink className="h-3 w-3" />
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