'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { 
  AlertCircle, 
  Lock, 
  CreditCard,
  Check,
  Info,
  Loader2
} from 'lucide-react';

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripePaymentFormProps {
  bookingId: string;
  serviceName: string;
  servicePrice: number;
  salonName: string;
  appointmentDate: string;
  appointmentTime: string;
  clientEmail: string;
  clientName: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

function PaymentForm({
  bookingId,
  serviceName,
  servicePrice,
  salonName,
  appointmentDate,
  appointmentTime,
  clientEmail,
  clientName,
  onSuccess,
  onError,
  onCancel
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  
  const BOOKING_FEE = 5; // $5 booking fee

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-success?booking_id=${bookingId}`,
          receipt_email: clientEmail,
        },
        redirect: 'if_required',
      });

      if (error) {
        // Handle different error types
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setMessage(error.message || 'Payment failed');
          onError(error.message || 'Payment failed');
        } else {
          setMessage('An unexpected error occurred.');
          onError('An unexpected error occurred.');
        }
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      setMessage('Failed to process payment. Please try again.');
      onError('Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Booking Summary */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-900">Booking Summary</h3>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Service Details */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium text-gray-900">{serviceName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Salon:</span>
              <span className="font-medium text-gray-900">{salonName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium text-gray-900">{formatDate(appointmentDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium text-gray-900">{formatTime(appointmentTime)}</span>
            </div>
          </div>
          
          {/* Price Breakdown */}
          <div className="border-t pt-4 space-y-3">
            {/* Service Price (Pay at Salon) */}
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-green-900">Service Price</p>
                  <p className="text-xs text-green-700 mt-0.5">Pay at salon</p>
                </div>
                <span className="text-lg font-semibold text-green-900">
                  ${servicePrice.toFixed(2)}
                </span>
              </div>
            </div>
            
            {/* Booking Fee (Pay Now) */}
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-purple-900">Booking Fee</p>
                  <p className="text-xs text-purple-700 mt-0.5">Due now to secure appointment</p>
                </div>
                <span className="text-xl font-bold text-purple-900">
                  ${BOOKING_FEE.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Important Information */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <p className="font-medium text-amber-900">Important Information:</p>
            <ul className="text-amber-800 space-y-0.5">
              <li>• The $5 booking fee is non-refundable</li>
              <li>• Pay the service price (${servicePrice}) directly at the salon</li>
              <li>• Arrive 10 minutes early for your appointment</li>
              <li>• Cancellations must be made 24 hours in advance</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Element */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gray-600" />
            Payment Information
          </h4>
          <p className="text-sm text-gray-500 mt-1">
            Enter your card details to pay the ${BOOKING_FEE} booking fee
          </p>
        </div>
        
        <PaymentElement 
          options={{
            layout: 'tabs',
          }}
        />
        
        {message && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {message}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!stripe || !elements || isProcessing}
          className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Pay ${BOOKING_FEE} Booking Fee
            </>
          )}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center text-xs text-gray-500 gap-2">
        <Lock className="w-3 h-3" />
        <span>Payments are secure and encrypted by Stripe</span>
      </div>
    </form>
  );
}

export default function StripePaymentForm(props: StripePaymentFormProps & { clientSecret: string }) {
  const options = {
    clientSecret: props.clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#9333ea',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm {...props} />
    </Elements>
  );
}