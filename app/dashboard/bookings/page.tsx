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
import { Calendar, List, Filter } from 'lucide-react'
import { Id } from '@/convex/_generated/dataModel'
import { useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

type ViewMode = 'calendar' | 'list'
type StatusFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export default function BookingsPage() {
  const { user, isLoaded } = useUser()
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
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
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
            <p className="text-gray-600 mt-1">Manage appointments, track status, and assign braiders</p>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'calendar'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  Calendar View
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <List className="h-4 w-4" />
                  List View
                </button>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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
            ) : (
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