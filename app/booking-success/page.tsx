'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, Loader2, AlertCircle, Calendar, Clock, Scissors, ChevronRight } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('booking_id');
  const paymentIntent = searchParams.get('payment_intent');
  const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
  const redirectStatus = searchParams.get('redirect_status');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch booking details if we have a booking ID
  const booking = useQuery(
    api.booking.getBookingById,
    bookingId ? { bookingId: bookingId as Id<"bookings"> } : "skip"
  );

  useEffect(() => {
    // Handle Stripe redirect status
    if (redirectStatus === 'succeeded') {
      setStatus('success');
    } else if (redirectStatus === 'failed') {
      setStatus('error');
      setErrorMessage('Payment failed. Please try again.');
    } else if (redirectStatus === 'requires_payment_method') {
      setStatus('error');
      setErrorMessage('Payment requires additional authentication. Please try again.');
    } else if (bookingId && !redirectStatus) {
      // Direct success without redirect (for standard card payments)
      setStatus('success');
    } else {
      // No valid parameters
      setStatus('error');
      setErrorMessage('Invalid booking information.');
    }
  }, [redirectStatus, bookingId]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Processing your booking...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Issue</h1>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
            <p className="text-green-50">Your appointment has been successfully booked</p>
          </div>

          {/* Booking Details */}
          {booking && (
            <div className="p-8">
              {/* Confirmation Number */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">Confirmation Number</p>
                <p className="font-mono text-lg font-semibold text-gray-900">
                  {booking._id.slice(-8).toUpperCase()}
                </p>
              </div>

              {/* Appointment Details */}
              <div className="space-y-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                    Appointment Details
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Date & Time</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(booking.appointmentDate)} at {formatTime(booking.appointmentTime)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Scissors className="w-4 h-4 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Service</p>
                        <p className="font-medium text-gray-900">{booking.serviceDetails?.style || 'Service'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Payment Summary</h3>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Service Price:</span>
                        <span className="font-medium">${booking.serviceDetails?.finalPrice || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Booking Fee Paid:</span>
                        <span className="font-medium text-green-600">$5.00 ✓</span>
                      </div>
                      <div className="pt-2 border-t border-purple-200 flex justify-between">
                        <span className="font-medium text-gray-900">Due at Salon:</span>
                        <span className="font-bold text-lg text-purple-600">${booking.serviceDetails?.finalPrice || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* What's Next */}
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-3">What's Next?</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>A confirmation email has been sent to {booking.client?.email || 'your email'}</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>You'll receive a reminder 24 hours before your appointment</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Please arrive 10 minutes early</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Bring ${booking.serviceDetails?.finalPrice || 0} to pay at the salon</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-center"
                >
                  Return to Home
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center"
                >
                  Print Confirmation
                </button>
              </div>
            </div>
          )}

          {/* Fallback if no booking details */}
          {!booking && status === 'success' && (
            <div className="p-8 text-center">
              <p className="text-gray-600 mb-6">
                Your payment was successful! You should receive a confirmation email shortly.
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Return to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}