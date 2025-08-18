'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileSidebar } from '@/components/dashboard/MobileSidebar'
import { TopBar } from '@/components/dashboard/TopBar'
import { BraiderOverview } from '@/components/braiders/BraiderOverview'
import { BraiderDetailModal } from '@/components/braiders/BraiderDetailModal'
import { BraiderManagementPanel } from '@/components/braiders/BraiderManagementPanel'
import { useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Users, DollarSign, Calendar, TrendingUp, Settings } from 'lucide-react'

export default function BraidersPage() {
  const { user, isLoaded } = useUser()
  const [selectedBraiderId, setSelectedBraiderId] = useState<Id<'braiders'> | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewPeriod, setViewPeriod] = useState<'day' | 'week' | 'month'>('week')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Check if coming from setup flow
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const isSetupMode = searchParams.get('setup') === 'true'
  const [viewMode, setViewMode] = useState<'overview' | 'settings'>(isSetupMode ? 'settings' : 'overview')
  
  // Get user data from Convex to get salonId
  const userData = useQuery(api.users.viewer)

  if (isLoaded && !user) {
    redirect('/sign-in')
  }

  // Get braiders with payout summary
  const braidersData = useQuery(
    api.braiderPayouts.getSalonBraidersPayoutSummary,
    userData?.salonId ? {
      salonId: userData.salonId,
      period: viewPeriod
    } : 'skip'
  )

  const handleBraiderClick = (braiderId: Id<'braiders'>) => {
    setSelectedBraiderId(braiderId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedBraiderId(null)
  }

  // Show loading state while fetching user data
  if (!userData || !userData.salonId || !braidersData) {
    return (
      <div className="flex h-screen bg-white">
        <Sidebar />
      
      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="max-w-[1600px] mx-auto">
              <div className="animate-pulse">
                <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="h-24 bg-gray-100 rounded"></div>
                  <div className="h-24 bg-gray-100 rounded"></div>
                  <div className="h-24 bg-gray-100 rounded"></div>
                  <div className="h-24 bg-gray-100 rounded"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="h-48 bg-gray-100 rounded"></div>
                  <div className="h-48 bg-gray-100 rounded"></div>
                  <div className="h-48 bg-gray-100 rounded"></div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="mb-4">
              <h1 className="text-xl font-semibold text-gray-900">Braiders</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage your team and process payouts</p>
            </div>

            {/* View Toggle */}
            <div className="bg-white border-b border-gray-200 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('overview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'overview'
                      ? 'bg-purple-50 text-purple-700'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Overview
                </button>
                <button
                  onClick={() => setViewMode('settings')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'settings'
                      ? 'bg-purple-50 text-purple-700'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  Team Settings
                </button>
              </div>
            </div>

            {/* Main Content */}
            {viewMode === 'overview' ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-5 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 font-normal mb-2">Total Braiders</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {braidersData.braiders.length}
                        </p>
                      </div>
                      <Users className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-5 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 font-normal mb-2">Pending Payouts</p>
                        <p className="text-2xl font-semibold text-orange-600">
                          ${braidersData.salonTotals.totalPending.toFixed(2)}
                        </p>
                      </div>
                      <DollarSign className="h-6 w-6 text-orange-400" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-5 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 font-normal mb-2">Paid This {viewPeriod}</p>
                        <p className="text-2xl font-semibold text-green-600">
                          ${braidersData.salonTotals.totalPaid.toFixed(2)}
                        </p>
                      </div>
                      <TrendingUp className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-5 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 font-normal mb-2">Total Bookings</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {braidersData.salonTotals.totalBookings}
                        </p>
                      </div>
                      <Calendar className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Period Filter */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-500">View period:</span>
                  <div className="flex gap-1">
                    {(['day', 'week', 'month'] as const).map((period) => (
                      <button
                        key={period}
                        onClick={() => setViewPeriod(period)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          viewPeriod === period
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Braider Cards */}
                <BraiderOverview
                  braiders={braidersData.braiders}
                  onBraiderClick={handleBraiderClick}
                />
              </>
            ) : (
              <div className="bg-white">
                <BraiderManagementPanel salonId={userData.salonId} />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Braider Detail Modal */}
      {selectedBraiderId && (
        <BraiderDetailModal
          braiderId={selectedBraiderId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}