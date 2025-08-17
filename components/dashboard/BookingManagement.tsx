'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';

interface BookingManagementProps {
  salonId: Id<"salons">;
}

export function BookingManagement({ salonId }: BookingManagementProps) {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  
  const bookings = useQuery(api.booking.getSalonBookings, {
    salonId,
    status: selectedStatus === 'all' ? undefined : selectedStatus,
  });
  
  const cancelBooking = useMutation(api.booking.cancelBooking);
  
  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      await cancelBooking({
        bookingId: selectedBooking._id,
        reason: cancelReason,
      });
      setShowCancelModal(false);
      setSelectedBooking(null);
      setCancelReason('');
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };
  
  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isPast(date)) return 'Past';
    return format(date, 'MMM d');
  };
  
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };
  
  const groupBookingsByDate = (bookings: any[]) => {
    const grouped: Record<string, any[]> = {};
    
    bookings.forEach(booking => {
      const date = booking.appointmentDate;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(booking);
    });
    
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, bookings]) => ({
        date,
        label: getDateLabel(date),
        bookings: bookings.sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime)),
      }));
  };
  
  if (!bookings) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  const groupedBookings = groupBookingsByDate(bookings);
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Booking Management</h2>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === 'all' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedStatus('pending')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === 'pending' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setSelectedStatus('confirmed')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === 'confirmed' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setSelectedStatus('completed')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === 'completed' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setSelectedStatus('cancelled')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === 'cancelled' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>
        
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedBookings.map(group => (
              <div key={group.date}>
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  {group.label} - {format(parseISO(group.date), 'EEEE, MMMM d, yyyy')}
                </h3>
                
                <div className="space-y-3">
                  {group.bookings.map((booking: any) => (
                    <div 
                      key={booking._id} 
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-lg font-semibold text-gray-900">
                              {formatTime(booking.appointmentTime)}
                            </span>
                            {getStatusBadge(booking.status)}
                          </div>
                          
                          <div className="space-y-1 text-sm">
                            <p className="font-medium text-gray-900">
                              {booking.client?.name || 'Unknown Client'}
                            </p>
                            <p className="text-gray-600">
                              {booking.serviceDetails.style} - {booking.serviceDetails.size} - {booking.serviceDetails.length}
                            </p>
                            <p className="text-gray-500">
                              {booking.serviceDetails.hairType}
                              {booking.serviceDetails.includeCurlyHair && ' + Curly Hair'}
                            </p>
                            <p className="font-medium text-orange-600">
                              ${booking.serviceDetails.finalPrice}
                            </p>
                          </div>
                          
                          {booking.notes && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                              {booking.notes}
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4 flex flex-col space-y-2">
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            View Details
                          </button>
                          {booking.status === 'pending' && (
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowCancelModal(true);
                              }}
                              className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded hover:bg-red-50"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Booking Details Modal */}
      {selectedBooking && !showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-medium">{selectedBooking.client?.name}</p>
                <p className="text-sm text-gray-600">{selectedBooking.client?.email}</p>
                <p className="text-sm text-gray-600">{selectedBooking.client?.phone}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Appointment</p>
                <p className="font-medium">
                  {format(parseISO(selectedBooking.appointmentDate), 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-sm text-gray-600">{formatTime(selectedBooking.appointmentTime)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Service</p>
                <p className="font-medium">{selectedBooking.serviceDetails.style}</p>
                <p className="text-sm text-gray-600">
                  {selectedBooking.serviceDetails.size} - {selectedBooking.serviceDetails.length}
                </p>
                <p className="text-sm text-gray-600">{selectedBooking.serviceDetails.hairType}</p>
                {selectedBooking.serviceDetails.includeCurlyHair && (
                  <p className="text-sm text-gray-600">+ Curly Hair</p>
                )}
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Payment</p>
                <p className="font-medium text-orange-600 text-lg">
                  ${selectedBooking.serviceDetails.finalPrice}
                </p>
                <p className="text-sm text-gray-600">
                  Platform Fee: $5 | Your Payout: ${selectedBooking.payoutAmount}
                </p>
              </div>
              
              {selectedBooking.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-sm">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Cancel Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Cancel Booking</h3>
            
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this booking with {selectedBooking.client?.name}?
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={3}
                placeholder="Provide a reason for the cancellation..."
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}