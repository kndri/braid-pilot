'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react'
import { Id } from '@/convex/_generated/dataModel'

interface Booking {
  _id: Id<'bookings'>
  appointmentDate: string
  appointmentTime: string
  status: string
  client?: {
    name: string
    email: string
  }
  serviceDetails?: {
    style: string
    finalPrice: number
  }
}

interface CalendarViewProps {
  bookings: Booking[]
  onBookingClick: (bookingId: Id<'bookings'>) => void
  loading?: boolean
}

export function CalendarView({ bookings, onBookingClick, loading = false }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Get first day of current month
  const firstDayOfMonth = useMemo(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    return date
  }, [currentDate])
  
  // Get last day of current month
  const lastDayOfMonth = useMemo(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    return date
  }, [currentDate])
  
  // Get calendar days (including padding for previous/next month)
  const calendarDays = useMemo(() => {
    const days = []
    const firstDay = firstDayOfMonth.getDay()
    const lastDate = lastDayOfMonth.getDate()
    
    // Add padding days from previous month
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(firstDayOfMonth)
      date.setDate(date.getDate() - i - 1)
      days.push({ date, isCurrentMonth: false })
    }
    
    // Add days of current month
    for (let i = 1; i <= lastDate; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
      days.push({ date, isCurrentMonth: true })
    }
    
    // Add padding days from next month
    const remainingDays = 42 - days.length // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(lastDayOfMonth)
      date.setDate(date.getDate() + i)
      days.push({ date, isCurrentMonth: false })
    }
    
    return days
  }, [currentDate, firstDayOfMonth, lastDayOfMonth])
  
  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const grouped: Record<string, Booking[]> = {}
    bookings.forEach(booking => {
      const dateKey = booking.appointmentDate
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(booking)
    })
    return grouped
  }, [bookings])
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }
  
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'completed': return 'bg-green-50 text-green-700 border-green-200'
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200'
      case 'no_show': return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      default: return 'bg-gray-50 text-gray-500 border-gray-100'
    }
  }
  
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-7 gap-4">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-50 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {formatMonthYear(currentDate)}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-50 rounded-md transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-md transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-50 rounded-md transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>
      
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-t-lg overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-b-lg overflow-hidden">
        {calendarDays.map(({ date, isCurrentMonth }, index) => {
          const dateStr = date.toISOString().split('T')[0]
          const dayBookings = bookingsByDate[dateStr] || []
          const isToday = date.toDateString() === new Date().toDateString()
          
          return (
            <div
              key={index}
              className={`bg-white min-h-[100px] p-2 ${
                !isCurrentMonth ? 'bg-gray-50' : ''
              } ${isToday ? 'ring-2 ring-indigo-500 ring-inset' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${
                  !isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
                } ${isToday ? 'text-indigo-600' : ''}`}>
                  {date.getDate()}
                </span>
                {dayBookings.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {dayBookings.length} booking{dayBookings.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              <div className="space-y-1">
                {dayBookings.slice(0, 3).map(booking => (
                  <button
                    key={booking._id}
                    onClick={() => onBookingClick(booking._id)}
                    className={`w-full text-left px-2 py-1 rounded text-xs font-medium border ${getStatusColor(booking.status)} hover:opacity-80 transition-opacity`}
                  >
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{booking.appointmentTime}</span>
                    </div>
                    <div className="truncate">
                      {booking.client?.name || 'Unknown'}
                    </div>
                  </button>
                ))}
                {dayBookings.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayBookings.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}