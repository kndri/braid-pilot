'use client'

import { User, Calendar, Clock, DollarSign, AlertCircle } from 'lucide-react'
import { Id } from '@/convex/_generated/dataModel'

interface Booking {
  _id: Id<'bookings'>
  appointmentDate: string
  appointmentTime: string
  status: string
  client?: {
    name: string
    email: string
    phone?: string
  }
  serviceDetails?: {
    style: string
    size?: string
    length?: string
    finalPrice: number
  }
  braiderId?: string
  notes?: string
}

interface BookingsListProps {
  bookings: Booking[]
  onBookingClick: (bookingId: Id<'bookings'>) => void
  loading?: boolean
}

export function BookingsList({ bookings, onBookingClick, loading = false }: BookingsListProps) {
  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      no_show: 'bg-orange-100 text-orange-700',
      pending: 'bg-yellow-100 text-yellow-700',
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700'}`}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    )
  }
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }
  
  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  if (bookings.length === 0) {
    return (
      <div className="p-12 text-center">
        <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
        <p className="text-gray-500">Try adjusting your filters or check back later.</p>
      </div>
    )
  }
  
  return (
    <div className="divide-y divide-gray-200">
      {/* Table Header */}
      <div className="px-6 py-3 bg-gray-50 grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
        <div className="col-span-3">Client</div>
        <div className="col-span-2">Date & Time</div>
        <div className="col-span-3">Service</div>
        <div className="col-span-2">Price</div>
        <div className="col-span-2">Status</div>
      </div>
      
      {/* Table Body */}
      {bookings.map((booking) => (
        <button
          key={booking._id}
          onClick={() => onBookingClick(booking._id)}
          className="w-full px-6 py-4 grid grid-cols-12 gap-4 hover:bg-gray-50 transition-colors text-left"
        >
          {/* Client Info */}
          <div className="col-span-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {booking.client?.name || 'Unknown Client'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {booking.client?.email}
                </p>
              </div>
            </div>
          </div>
          
          {/* Date & Time */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 text-sm text-gray-900">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>{formatDate(booking.appointmentDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <Clock className="h-3 w-3 text-gray-400" />
              <span>{booking.appointmentTime}</span>
            </div>
          </div>
          
          {/* Service */}
          <div className="col-span-3">
            <p className="text-sm font-medium text-gray-900">
              {booking.serviceDetails?.style || 'Service'}
            </p>
            {booking.serviceDetails?.size && (
              <p className="text-xs text-gray-500 mt-1">
                {booking.serviceDetails.size} • {booking.serviceDetails.length}
              </p>
            )}
          </div>
          
          {/* Price */}
          <div className="col-span-2">
            <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span>{booking.serviceDetails?.finalPrice || 0}</span>
            </div>
          </div>
          
          {/* Status */}
          <div className="col-span-2">
            {getStatusBadge(booking.status)}
          </div>
        </button>
      ))}
    </div>
  )
}