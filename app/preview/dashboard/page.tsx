"use client"
import { useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { TopBar } from '@/components/dashboard/TopBar'
import { SummaryStatCard } from '@/components/dashboard/SummaryStatCard'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { UpcomingAppointments } from '@/components/dashboard/UpcomingAppointments'
import { YourTools } from '@/components/dashboard/YourTools'
import { Calendar, Users, DollarSign, Phone } from 'lucide-react'

export default function DashboardMarketingPreview() {
  // Hide Next.js dev logo/toolbar in dev for clean marketing screenshots
  useEffect(() => {
    const hide = () => {
      const selectors = [
        '[aria-label="Next.js"]',
        '#__nextDevToolbar',
        '#__nextDevOverlay',
        '#__next-build-watcher',
        '#__nextDevTools',
        '[data-nextjs-devtools]',
        '[data-nextjs-toolbox]',
        '#nextjs__container',
        '#nextjs-toast',
        '.nextjs-container',
      ]
      const css = `
        ${selectors.join(',')} { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; }
      `
      const style = document.createElement('style')
      style.textContent = css
      document.head.appendChild(style)
    }
    hide()
    const mo = new MutationObserver(hide)
    mo.observe(document.documentElement, { subtree: true, childList: true })
    return () => mo.disconnect()
  }, [])
  // Mock stats
  const totalBookings = 150
  const totalClients = 78
  const totalRevenue = 26600

  const upcomingAppointments = [
    { id: '1', clientName: 'Emma Brown', time: '08:00 PM', service: 'Box Braids', date: 'Jul 2, 2025' },
    { id: '2', clientName: 'Mia Jones', time: '08:00 PM', service: 'Knotless Braids', date: 'Mar 5, 2025' },
    { id: '3', clientName: 'Olivia Jones', time: '08:00 PM', service: 'Knotless Braids', date: 'Aug 31, 2025' }
  ]

  // Transactions component already has rich defaults; render as-is

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-[1600px] mx-auto">
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <SummaryStatCard title="No. of Bookings" value={totalBookings} delta={0} icon={Calendar} loading={false} />
              <SummaryStatCard title="No. of Clients" value={totalClients} delta={0} icon={Users} loading={false} />
              <SummaryStatCard title="Revenue" value={`$${(totalRevenue / 1000).toFixed(1)}k`} delta={0} icon={DollarSign} loading={false} />
              <SummaryStatCard title="VR Calls" value={'-'} delta={0} icon={Phone} loading={false} />
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-7 space-y-6">
                <UpcomingAppointments appointments={upcomingAppointments} loading={false} bookingProEnabled={true} />
                <RecentTransactions />
              </div>
              <div className="xl:col-span-5">
                <YourTools quoteToolUrl="http://localhost:3000/quote/ellebraids" virtualReceptionistEnabled={false} automateReviewsEnabled={false} bookingProEnabled={true} />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}


