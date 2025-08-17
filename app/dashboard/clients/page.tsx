'use client'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileSidebar } from '@/components/dashboard/MobileSidebar'
import { TopBar } from '@/components/dashboard/TopBar'
import { ClientList } from '@/components/crm/ClientList'
import { ClientProfile } from '@/components/crm/ClientProfile'
import { useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useState } from 'react'
import { Id } from '@/convex/_generated/dataModel'

export default function ClientsPage() {
  const { user, isLoaded } = useUser()
  const [selectedClientId, setSelectedClientId] = useState<Id<"clients"> | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Get user data from Convex to get salonId
  const userData = useQuery(api.users.viewer)

  if (isLoaded && !user) {
    redirect('/sign-in')
  }

  // Show loading state while fetching user data
  if (!userData || !userData.salonId) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
      
      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="max-w-[1600px] mx-auto">
              <div className="animate-pulse">
                <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
                <div className="space-y-4">
                  <div className="h-20 bg-gray-100 rounded"></div>
                  <div className="h-20 bg-gray-100 rounded"></div>
                  <div className="h-20 bg-gray-100 rounded"></div>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Client Management</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ClientList 
                  salonId={userData.salonId} 
                  onSelectClient={setSelectedClientId}
                />
              </div>
              {selectedClientId && (
                <div className="lg:col-span-1">
                  <ClientProfile 
                    clientId={selectedClientId}
                    salonId={userData.salonId}
                    onClose={() => setSelectedClientId(null)}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}