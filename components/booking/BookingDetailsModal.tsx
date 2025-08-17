'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { 
  X, User, Calendar, Clock, DollarSign, Phone, Mail,
  CheckCircle, XCircle, AlertCircle, RefreshCw, UserPlus
} from 'lucide-react'

interface Braider {
  _id: Id<'braiders'>
  name: string
  specialties: string[]
}

interface BookingDetailsModalProps {
  bookingId: Id<'bookings'>
  isOpen: boolean
  onClose: () => void
  braiders: Braider[]
}

export function BookingDetailsModal({ bookingId, isOpen, onClose, braiders }: BookingDetailsModalProps) {
  const [showReschedule, setShowReschedule] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [selectedBraiderId, setSelectedBraiderId] = useState<Id<'braiders'> | ''>('')
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Fetch booking details
  const booking = useQuery(api.booking.getBookingById, { bookingId })
  
  // Mutations
  const updateStatus = useMutation(api.booking.updateBookingStatus)
  const rescheduleBooking = useMutation(api.booking.rescheduleBooking)
  const assignBraider = useMutation(api.booking.assignBraider)
  
  useEffect(() => {
    if (booking?.braiderId) {
      setSelectedBraiderId(booking.braiderId)
    }
  }, [booking])
  
  if (!isOpen || !booking) return null
  
  const handleStatusUpdate = async (status: 'completed' | 'no_show' | 'cancelled') => {
    setIsUpdating(true)
    try {
      await updateStatus({ bookingId, status })
      onClose()
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update booking status')
    } finally {
      setIsUpdating(false)
    }
  }
  
  const handleReschedule = async () => {
    if (!newDate || !newTime) {
      alert('Please select both date and time')
      return
    }
    
    setIsUpdating(true)
    try {
      await rescheduleBooking({ bookingId, newDate, newTime })
      setShowReschedule(false)
      onClose()
    } catch (error) {
      console.error('Failed to reschedule:', error)
      alert('Failed to reschedule booking')
    } finally {
      setIsUpdating(false)
    }
  }
  
  const handleBraiderAssignment = async () => {
    if (!selectedBraiderId) {
      alert('Please select a braider')
      return
    }
    
    setIsUpdating(true)
    try {
      await assignBraider({ 
        bookingId, 
        braiderId: selectedBraiderId as Id<'braiders'>
      })
      alert('Braider assigned successfully')
    } catch (error) {
      console.error('Failed to assign braider:', error)
      alert('Failed to assign braider')
    } finally {
      setIsUpdating(false)
    }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-blue-600 bg-blue-50'
      case 'completed': return 'text-green-600 bg-green-50'
      case 'cancelled': return 'text-red-600 bg-red-50'
      case 'no_show': return 'text-orange-600 bg-orange-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-lg shadow-xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Appointment Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {booking.status.replace('_', ' ').toUpperCase()}
            </span>
            <span className="text-sm text-gray-500">
              Booking ID: {booking._id.slice(-8)}
            </span>
          </div>
          
          {/* Client Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Client Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900">{booking.client?.name || 'Unknown'}</span>
              </div>
              {booking.client?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{booking.client.email}</span>
                </div>
              )}
              {booking.client?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{booking.client.phone}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Appointment Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Appointment Details</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900">{formatDate(booking.appointmentDate)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900">{booking.appointmentTime}</span>
              </div>
            </div>
          </div>
          
          {/* Service Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Service Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Style:</span>
                <span className="text-sm font-medium text-gray-900">{booking.serviceDetails?.style}</span>
              </div>
              {booking.serviceDetails?.size && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Size:</span>
                  <span className="text-sm font-medium text-gray-900">{booking.serviceDetails.size}</span>
                </div>
              )}
              {booking.serviceDetails?.length && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Length:</span>
                  <span className="text-sm font-medium text-gray-900">{booking.serviceDetails.length}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t">
                <span className="text-sm font-medium text-gray-700">Total Price:</span>
                <span className="text-sm font-bold text-gray-900">
                  ${booking.serviceDetails?.finalPrice || 0}
                </span>
              </div>
            </div>
          </div>
          
          {/* Braider Assignment */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Braider Assignment</h3>
            <div className="flex items-center gap-3">
              <select
                value={selectedBraiderId}
                onChange={(e) => setSelectedBraiderId(e.target.value as Id<'braiders'>)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isUpdating}
              >
                <option value="">Select a braider...</option>
                {braiders.map(braider => (
                  <option key={braider._id} value={braider._id}>
                    {braider.name} - {braider.specialties.join(', ')}
                  </option>
                ))}
              </select>
              <button
                onClick={handleBraiderAssignment}
                disabled={!selectedBraiderId || isUpdating}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 transition-colors flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Assign
              </button>
            </div>
          </div>
          
          {/* Notes */}
          {booking.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
              <p className="text-sm text-gray-600">{booking.notes}</p>
            </div>
          )}
          
          {/* Reschedule Section */}
          {showReschedule && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-medium text-blue-900 mb-3">Reschedule Appointment</h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => setShowReschedule(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReschedule}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
                >
                  Confirm Reschedule
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {booking.status !== 'completed' && booking.status !== 'cancelled' && (
              <>
                <button
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark as Completed
                </button>
                <button
                  onClick={() => handleStatusUpdate('no_show')}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 transition-colors flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  Mark as No-Show
                </button>
                <button
                  onClick={() => setShowReschedule(!showReschedule)}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reschedule
                </button>
                <button
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 transition-colors flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Appointment
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}