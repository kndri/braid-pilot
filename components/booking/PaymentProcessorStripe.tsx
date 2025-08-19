'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import dynamic from 'next/dynamic';
import { Loader2, AlertCircle } from 'lucide-react';

// Dynamically import Stripe component to avoid SSR issues
const StripePaymentForm = dynamic(
  () => import('./StripePaymentForm'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }
);

interface PaymentProcessorStripeProps {
  bookingId: Id<"bookings">;
  amount: number; // The booking fee amount ($5)
  serviceTotal?: number; // The total service price (for display)
  onSuccess: () => void;
  onFailure: () => void;
}

export function PaymentProcessorStripe({ 
  bookingId, 
  amount, 
  serviceTotal, 
  onSuccess, 
  onFailure 
}: PaymentProcessorStripeProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const confirmBooking = useMutation(api.booking.confirmBooking);
  const booking = useQuery(api.booking.getBookingById, { bookingId });
  
  // Create payment intent when component mounts
  useEffect(() => {
    async function createPaymentIntent() {
      if (!booking) return;
      
      try {
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId,
            clientEmail: booking.client?.email || 'customer@example.com',
            clientName: booking.client?.name || 'Customer',
            serviceName: booking.serviceDetails?.style || 'Service',
            servicePrice: serviceTotal || booking.serviceDetails?.finalPrice || 0,
            salonName: 'BraidPilot Salon', // TODO: Get actual salon name
            appointmentDate: booking.appointmentDate,
            appointmentTime: booking.appointmentTime,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create payment intent');
        }
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
      } finally {
        setIsLoading(false);
      }
    }
    
    createPaymentIntent();
  }, [booking, bookingId, serviceTotal]);
  
  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Confirm the booking with the payment ID
      await confirmBooking({
        bookingId,
        stripePaymentIntentId: paymentIntentId,
      });
      
      onSuccess();
    } catch (error) {
      console.error('Failed to confirm booking:', error);
      setError('Payment succeeded but failed to confirm booking. Please contact support.');
    }
  };
  
  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    // Don't call onFailure immediately - let user retry
  };
  
  const handleCancel = () => {
    onFailure();
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className="text-gray-600">Preparing secure payment...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error && !clientSecret) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Initialization Failed</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Try Again
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Payment form
  if (clientSecret && booking) {
    return (
      <StripePaymentForm
        clientSecret={clientSecret}
        bookingId={bookingId}
        serviceName={booking.serviceDetails?.style || 'Service'}
        servicePrice={serviceTotal || booking.serviceDetails?.finalPrice || 0}
        salonName="BraidPilot Salon"
        appointmentDate={booking.appointmentDate}
        appointmentTime={booking.appointmentTime}
        clientEmail={booking.client?.email || ''}
        clientName={booking.client?.name || ''}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        onCancel={handleCancel}
      />
    );
  }
  
  return null;
}