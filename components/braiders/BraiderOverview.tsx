'use client'

import { User, Clock, DollarSign, Calendar, TrendingUp, AlertCircle } from 'lucide-react'
import { Id } from '@/convex/_generated/dataModel'

interface BraiderSummary {
  _id: Id<'braiders'>
  name: string
  email?: string
  phone?: string
  specialties?: string[]
  isActive: boolean
  totalEarnings: number
  totalPaid: number
  totalPending: number
  bookingCount: number
  workload: {
    todayBookings: number
    todayHours: number
    weeklyBookings: number
    weeklyHours: number
  }
}

interface BraiderOverviewProps {
  braiders: BraiderSummary[]
  onBraiderClick: (braiderId: Id<'braiders'>) => void
}

export function BraiderOverview({ braiders, onBraiderClick }: BraiderOverviewProps) {
  const getWorkloadColor = (hours: number) => {
    if (hours >= 8) return 'text-red-600 bg-red-50'
    if (hours >= 6) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  const getPayoutStatusColor = (pending: number) => {
    if (pending > 500) return 'text-red-600'
    if (pending > 200) return 'text-orange-600'
    if (pending > 0) return 'text-yellow-600'
    return 'text-green-600'
  }

  if (braiders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Braiders Yet</h3>
        <p className="text-gray-500">Add your first braider to start managing your team.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {braiders.map((braider) => (
        <div
          key={braider._id}
          onClick={() => onBraiderClick(braider._id)}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{braider.name}</h3>
                <p className="text-sm text-gray-500">{braider.email || 'No email'}</p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              braider.isActive 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {braider.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Specialties */}
          {braider.specialties && braider.specialties.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {braider.specialties.slice(0, 3).map((specialty, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs"
                  >
                    {specialty}
                  </span>
                ))}
                {braider.specialties.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    +{braider.specialties.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Workload */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-600">Today</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {braider.workload.todayBookings} bookings
              </p>
              <p className={`text-xs ${getWorkloadColor(braider.workload.todayHours).split(' ')[0]}`}>
                {braider.workload.todayHours.toFixed(1)} hours
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-600">This Week</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {braider.workload.weeklyBookings} bookings
              </p>
              <p className="text-xs text-gray-600">
                {braider.workload.weeklyHours.toFixed(1)} hours
              </p>
            </div>
          </div>

          {/* Earnings Summary */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Earnings</span>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Total Earned</span>
                <span className="text-sm font-semibold text-gray-900">
                  ${braider.totalEarnings.toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Paid</span>
                <span className="text-sm font-semibold text-green-600">
                  ${braider.totalPaid.toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Pending</span>
                <div className="flex items-center gap-1">
                  {braider.totalPending > 0 && (
                    <AlertCircle className={`h-3 w-3 ${getPayoutStatusColor(braider.totalPending)}`} />
                  )}
                  <span className={`text-sm font-semibold ${getPayoutStatusColor(braider.totalPending)}`}>
                    ${braider.totalPending.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payout Status Indicator */}
            {braider.totalPending > 0 && (
              <div className={`mt-3 px-3 py-2 rounded-lg text-xs font-medium text-center ${
                braider.totalPending > 500 
                  ? 'bg-red-50 text-red-700' 
                  : braider.totalPending > 200
                  ? 'bg-orange-50 text-orange-700'
                  : 'bg-yellow-50 text-yellow-700'
              }`}>
                Payment Pending: ${braider.totalPending.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}