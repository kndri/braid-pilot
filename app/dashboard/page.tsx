'use client'

import React, { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileSidebar } from '@/components/dashboard/MobileSidebar'
import { TopBar } from '@/components/dashboard/TopBar'
import { SummaryStatCard } from '@/components/dashboard/SummaryStatCard'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { UpcomingAppointments } from '@/components/dashboard/UpcomingAppointments'
import { YourTools } from '@/components/dashboard/YourTools'
import { DashboardErrorBoundary } from '@/components/dashboard/DashboardErrorBoundary'
import { useTimezone } from '@/hooks/useTimezone'
import { 
  Users, 
  DollarSign,
  Calendar,
  Phone
} from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { formatTime, formatDate } = useTimezone()
  
  // Fetch dashboard data
  const dashboardData = useQuery(api.dashboard.getDashboardData)
  const stats = useQuery(api.dashboard.getStats)
  const recentBookings = useQuery(api.dashboard.getRecentBookings)
  const upcomingAppointments = useQuery(api.dashboard.getUpcomingAppointments)

  // Redirect if not authenticated
  if (isLoaded && !user) {
    redirect('/sign-in')
  }

  // Redirect to onboarding if pricing is not configured
  useEffect(() => {
    if (dashboardData && !dashboardData.hasPricingConfigured) {
      redirect('/onboarding')
    }
  }, [dashboardData])

  // Calculate statistics
  const totalBookings = stats?.totalBookings || 0
  const totalRevenue = stats?.totalRevenue || 0
  const totalClients = stats?.totalClients || 0
  
  // Calculate month-over-month changes (would need historical data - setting to 0 for now)
  const bookingsChange = 0
  const revenueChange = 0
  const clientsChange = 0

  // Transform bookings to transactions format
  const transactions = recentBookings?.map(booking => ({
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


  const isLoading = !stats || !recentBookings || !upcomingAppointments

  // Transform upcoming appointments for the component with timezone support
  const upcomingAppointmentsList = upcomingAppointments?.map(appointment => ({
    id: appointment._id,
    clientName: appointment.clientName || 'Unknown Client',
    time: formatTime(appointment.appointmentDate),
    service: appointment.serviceDetails?.style || 'Service',
    date: formatDate(appointment.appointmentDate, { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  })) || []

  // Check feature status
  const virtualReceptionistEnabled = false // Would check VR status
  const automateReviewsEnabled = false // Would check review automation
  const bookingProEnabled = true // Would check subscription status

  return (
    <div className="flex h-screen bg-white">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <DashboardErrorBoundary>
            <div className="max-w-[1600px] mx-auto">
          {/* KPI Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <SummaryStatCard
              title="No. of Bookings"
              value={totalBookings}
              delta={bookingsChange}
              icon={Calendar}
              loading={isLoading}
            />
            <SummaryStatCard
              title="No. of Clients"
              value={totalClients}
              delta={clientsChange}
              icon={Users}
              loading={isLoading}
            />
            <SummaryStatCard
              title="Revenue"
              value={`$${(totalRevenue / 1000).toFixed(1)}k`}
              delta={revenueChange}
              icon={DollarSign}
              loading={isLoading}
            />
            <SummaryStatCard
              title="VR Calls"
              value={virtualReceptionistEnabled ? 0 : '-'}
              delta={0}
              icon={Phone}
              loading={isLoading}
            />
          </section>

          {/* Main Content Grid */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="xl:col-span-7 space-y-6">
              {/* Upcoming Appointments */}
              <UpcomingAppointments
                appointments={upcomingAppointmentsList}
                loading={isLoading}
                bookingProEnabled={bookingProEnabled}
              />
              
              {/* Recent Activity */}
              <RecentTransactions 
                transactions={transactions}
                loading={isLoading}
              />
            </div>
            
            {/* Right Column */}
            <div className="xl:col-span-5">
              {/* Your Tools */}
              <YourTools
                quoteToolUrl={dashboardData?.salon?.quoteToolUrl}
                virtualReceptionistEnabled={virtualReceptionistEnabled}
                automateReviewsEnabled={automateReviewsEnabled}
                bookingProEnabled={bookingProEnabled}
              />
            </div>
          </section>
          </div>
          </DashboardErrorBoundary>
        </main>
      </div>
    </div>
  )
}