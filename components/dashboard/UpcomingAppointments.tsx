'use client'

import { Calendar, Clock, User } from 'lucide-react'

interface Appointment {
  id: string
  clientName: string
  time: string
  service: string
  date: string
}

interface UpcomingAppointmentsProps {
  appointments?: Appointment[]
  loading?: boolean
  bookingProEnabled?: boolean
}

export function UpcomingAppointments({ 
  appointments = [], 
  loading = false,
  bookingProEnabled = true 
}: UpcomingAppointmentsProps) {
  
  if (!bookingProEnabled) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Upgrade to Booking Pro</h3>
        <p className="text-sm text-gray-600 mb-4">
          Manage appointments, track availability, and automate scheduling with Booking Pro.
        </p>
        <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg py-2 px-4 font-medium hover:opacity-90 transition-opacity">
          Upgrade Now
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Appointments</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Appointments</h3>
      {appointments.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No upcoming appointments</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.slice(0, 3).map((appointment) => (
            <div key={appointment.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {appointment.clientName}
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {appointment.time}
                  </span>
                  <span className="text-xs text-gray-600 truncate">
                    {appointment.service}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}