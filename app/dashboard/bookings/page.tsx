'use client'

import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileSidebar } from '@/components/dashboard/MobileSidebar'
import { TopBar } from '@/components/dashboard/TopBar'
import { BookingDetailsModal } from '@/components/booking/BookingDetailsModal'
import { CalendarView } from '@/components/booking/CalendarView'
import { BookingsList } from '@/components/booking/BookingsList'
import { CapacityManagementPanel } from '@/components/capacity/CapacityManagementPanel'
import { Calendar, List, Filter, Settings } from 'lucide-react'
import { Id } from '@/convex/_generated/dataModel'
import { useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

type ViewMode = 'calendar' | 'list' | 'settings'
type StatusFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export default function BookingsPage() {
  const { user, isLoaded } = useUser()
  
  // Check if coming from setup flow
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const viewParam = searchParams.get('view')
  const initialView: ViewMode = viewParam === 'settings' ? 'settings' : 'calendar'
  
  const [viewMode, setViewMode] = useState<ViewMode>(initialView)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedBookingId, setSelectedBookingId] = useState<Id<'bookings'> | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Redirect if not authenticated
  if (isLoaded && !user) {
    redirect('/sign-in')
  }

  // Get salon data
  const userData = useQuery(api.users.viewer)
  const salonId = userData?.salonId

  // Fetch bookings based on filter
  const bookings = useQuery(
    api.booking.getSalonBookings,
    salonId ? {
      salonId,
      status: statusFilter === 'all' ? undefined : (statusFilter as 'pending' | 'confirmed' | 'completed' | 'cancelled')
    } : 'skip'
  )

  // Fetch braiders for assignment
  const braiders = useQuery(
    api.braiders.getSalonBraiders,
    salonId ? { salonId } : 'skip'
  )

  const handleBookingClick = (bookingId: Id<'bookings'>) => {
    setSelectedBookingId(bookingId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedBookingId(null)
  }

  const statusOptions: { value: StatusFilter; label: string; color: string }[] = [
    { value: 'all', label: 'All Bookings', color: 'bg-gray-100 text-gray-700' },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
    { value: 'no_show', label: 'No-Show', color: 'bg-orange-100 text-orange-700' },
  ]

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      
      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Bookings</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage appointments and assign braiders</p>
          </div>

          {/* Controls */}
          <div className="bg-white border-b border-gray-200 pb-4 mb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'calendar'
                      ? 'bg-purple-50 text-purple-700'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  Calendar
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-purple-50 text-purple-700'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <List className="h-4 w-4" />
                  List
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
                  Capacity Settings
                </button>
              </div>

              {/* Status Filter - Only show for calendar and list views */}
              {viewMode !== 'settings' && (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className="px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-300"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white">
            {viewMode === 'calendar' ? (
              <CalendarView
                bookings={bookings?.map(b => ({
                  _id: b._id,
                  appointmentDate: b.appointmentDate,
                  appointmentTime: b.appointmentTime,
                  status: b.status,
                  client: b.client ? {
                    name: b.client.name,
                    email: b.client.email
                  } : undefined,
                  serviceDetails: b.serviceDetails
                })) || []}
                onBookingClick={handleBookingClick}
                loading={!bookings}
              />
            ) : viewMode === 'list' ? (
              <BookingsList
                bookings={bookings?.map(b => ({
                  _id: b._id,
                  appointmentDate: b.appointmentDate,
                  appointmentTime: b.appointmentTime,
                  status: b.status,
                  client: b.client ? {
                    name: b.client.name,
                    email: b.client.email,
                    phone: b.client.phone
                  } : undefined,
                  serviceDetails: b.serviceDetails,
                  clientName: b.client?.name || 'Unknown Client',
                  clientEmail: b.client?.email || '',
                  clientPhone: b.client?.phone || ''
                })) || []}
                onBookingClick={handleBookingClick}
                loading={!bookings}
              />
            ) : (
              salonId && <CapacityManagementPanel salonId={salonId} />
            )}
          </div>
          </div>
        </main>
      </div>

      {/* Booking Details Modal */}
      {selectedBookingId && (
        <BookingDetailsModal
          bookingId={selectedBookingId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          braiders={braiders?.map(b => ({
            _id: b._id,
            name: b.name,
            specialties: b.specialties || []
          })) || []}
        />
      )}
    </div>
  )
}