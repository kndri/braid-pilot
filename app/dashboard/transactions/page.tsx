'use client'

import { useState } from 'react'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileSidebar } from '@/components/dashboard/MobileSidebar'
import { TopBar } from '@/components/dashboard/TopBar'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { DollarSign, TrendingUp, TrendingDown, CreditCard } from 'lucide-react'

export default function TransactionsPage() {
  const { user, isLoaded } = useUser()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const stats = useQuery(api.dashboard.getStats)
  const allBookings = useQuery(api.dashboard.getRecentBookings)

  if (isLoaded && !user) {
    redirect('/sign-in')
  }

  // Transform all bookings to transaction format
  const transactions = allBookings?.map(booking => ({
    id: booking._id,
    clientName: booking.clientName || 'Unknown Client',
    clientEmail: booking.clientEmail || '',
    date: new Date(booking.appointmentDate).toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }),
    serviceType: booking.serviceDetails?.style || 'Service',
    styleName: `${booking.serviceDetails?.size || ''} ${booking.serviceDetails?.style || ''}, ${booking.serviceDetails?.length || ''}`.trim(),
    status: booking.status === 'confirmed' ? 'paid' as const : 
            booking.status === 'cancelled' ? 'cancelled' as const : 
            'pending' as const,
    amount: booking.serviceDetails?.finalPrice || 0
  })) || []

  const totalRevenue = stats?.totalRevenue || 0
  const platformFees = totalRevenue * 0.05 // 5% platform fee
  const netRevenue = totalRevenue - platformFees

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      
      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-[1600px] mx-auto">
            <div className="mb-4">
              <h1 className="text-xl font-semibold text-gray-900">Transactions</h1>
              <p className="text-sm text-gray-500 mt-1">View and manage your payment transactions</p>
            </div>
            
            {/* Revenue Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-lg border border-gray-100 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="rounded-lg bg-green-100 p-3">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-100 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Platform Fees</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      ${platformFees.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="rounded-lg bg-yellow-100 p-3">
                    <CreditCard className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-100 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Net Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      ${netRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="rounded-lg bg-blue-100 p-3">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <RecentTransactions transactions={transactions} loading={!allBookings} />
          </div>
        </main>
      </div>
    </div>
  )
}