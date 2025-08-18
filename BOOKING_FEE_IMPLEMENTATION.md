# $5 Booking Fee Implementation Guide (Simplified)

## Payment Model
- **Platform collects**: $5 booking fee only (at time of booking)
- **Salon collects**: Full service price (at time of appointment)
- **No Stripe Connect needed**: Platform doesn't handle salon payments

## Implementation Steps

### Step 1: Environment Variables
Add to `.env.local`:
```bash
# Stripe Configuration (Platform Account Only)
STRIPE_SECRET_KEY=sk_test_xxx  # Your Stripe secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx  # Your Stripe public key
STRIPE_WEBHOOK_SECRET=whsec_xxx  # Webhook endpoint secret

# Platform Fee Configuration
PLATFORM_BOOKING_FEE=500  # $5.00 in cents
PLATFORM_NAME="BraidPilot"

# Test Mode
ENABLE_TEST_MODE=true  # Enable test card bypass in development
```

### Step 2: Test Cards Configuration
```typescript
// lib/testCards.ts
export const TEST_CARDS = {
  // Standard Stripe test cards
  SUCCESS: '4242424242424242',
  DECLINE: '4000000000000002',
  INSUFFICIENT: '4000000000009995',
  
  // Platform bypass cards (no actual charge)
  BYPASS_DEMO: '5555555555554444',  // For demos
  BYPASS_ADMIN: '3782822463100005',  // For admin testing
};

export function isTestBypassCard(cardNumber: string): boolean {
  const clean = cardNumber.replace(/\s/g, '');
  return clean === TEST_CARDS.BYPASS_DEMO || 
         clean === TEST_CARDS.BYPASS_ADMIN;
}
```

### Step 3: Stripe Service (Simplified)
```typescript
// lib/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const BOOKING_FEE = 500; // $5.00 in cents

export async function createBookingFeePayment({
  bookingId,
  clientEmail,
  clientName,
  serviceName,
  servicePrice,
  appointmentDate,
}: {
  bookingId: string;
  clientEmail: string;
  clientName: string;
  serviceName: string;
  servicePrice: number;  // For display only
  appointmentDate: string;
}) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: BOOKING_FEE,  // Always $5
    currency: 'usd',
    description: `Booking fee for ${serviceName}`,
    receipt_email: clientEmail,
    metadata: {
      bookingId,
      clientEmail,
      clientName,
      serviceName,
      servicePrice: servicePrice.toString(),
      appointmentDate,
      feeType: 'booking_fee',
    },
  });
  
  return paymentIntent;
}

// For test bypass cards
export function createTestBooking(data: any) {
  return {
    id: `pi_test_${Date.now()}`,
    client_secret: `test_secret_${Date.now()}`,
    status: 'succeeded',
    metadata: {
      ...data,
      testMode: true,
    },
  };
}
```

### Step 4: Updated Payment Component
```typescript
// components/booking/BookingFeePayment.tsx
'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { AlertCircle, Lock, CreditCard } from 'lucide-react';
import { isTestBypassCard } from '@/lib/testCards';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface BookingFeePaymentProps {
  servicePrice: number;
  serviceName: string;
  bookingId: string;
  salonName: string;
  appointmentDate: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

function CheckoutForm(props: BookingFeePaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState('');
  
  const BOOKING_FEE = 5;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    setIsProcessing(true);
    
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;
    
    // Check for test bypass card
    const { error: methodError, paymentMethod } = 
      await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: { email },
      });
    
    if (methodError) {
      props.onError(methodError.message || 'Payment failed');
      setIsProcessing(false);
      return;
    }
    
    // Check if test bypass (dev only)
    if (process.env.NODE_ENV === 'development') {
      const cardNum = paymentMethod?.card?.last4 || '';
      if (cardNum === '4444' || cardNum === '0005') {
        // Test bypass - no real charge
        console.log('Test card bypass - no charge');
        props.onSuccess(`test_bypass_${Date.now()}`);
        setIsProcessing(false);
        return;
      }
    }
    
    // Create payment intent for booking fee
    const response = await fetch('/api/booking-fee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: props.bookingId,
        email,
        serviceName: props.serviceName,
        servicePrice: props.servicePrice,
        appointmentDate: props.appointmentDate,
      }),
    });
    
    const { clientSecret } = await response.json();
    
    // Confirm the $5 booking fee payment
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod.id,
    });
    
    if (result.error) {
      props.onError(result.error.message || 'Payment failed');
    } else {
      props.onSuccess(result.paymentIntent.id);
    }
    
    setIsProcessing(false);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Clear Pricing Breakdown */}
      <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h3 className="font-semibold text-gray-900">Booking Summary</h3>
        </div>
        
        <div className="p-4 space-y-3">
          {/* Service Details */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium">{props.serviceName}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Salon:</span>
              <span className="font-medium">{props.salonName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{props.appointmentDate}</span>
            </div>
          </div>
          
          {/* Price Breakdown */}
          <div className="border-t pt-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Service Price:</span>
              <span className="line-through text-gray-400">
                ${props.servicePrice.toFixed(2)}
              </span>
            </div>
            <div className="bg-green-50 -mx-4 px-4 py-2 mb-2">
              <div className="flex justify-between text-sm font-medium text-green-800">
                <span>✓ Pay at salon</span>
                <span>${props.servicePrice.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <span className="font-semibold text-gray-900">
                  Booking Fee (Due Now)
                </span>
                <p className="text-xs text-gray-500 mt-0.5">
                  Secures your appointment
                </p>
              </div>
              <span className="text-2xl font-bold text-purple-600">
                ${BOOKING_FEE.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Important Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <div className="flex gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Important:</p>
            <ul className="space-y-0.5 text-xs">
              <li>• The $5 booking fee is non-refundable</li>
              <li>• Pay the service price (${props.servicePrice}) directly at the salon</li>
              <li>• Cancellations must be made 24 hours in advance</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Email Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email for Receipt
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="your@email.com"
        />
      </div>
      
      {/* Card Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card Information
        </label>
        <div className="border border-gray-300 rounded-lg p-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': { color: '#aab7c4' },
                },
              },
            }}
          />
        </div>
      </div>
      
      {/* Test Mode Helper */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-50 rounded-lg p-3 text-xs">
          <p className="font-medium text-blue-900 mb-1">Test Cards:</p>
          <div className="space-y-0.5 text-blue-700">
            <div>✅ Success: 4242 4242 4242 4242</div>
            <div>🚫 Decline: 4000 0000 0000 0002</div>
            <div>🎫 No Charge: 5555 5555 5555 4444</div>
          </div>
        </div>
      )}
      
      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Pay ${BOOKING_FEE} Booking Fee
          </>
        )}
      </button>
      
      {/* Security Notice */}
      <div className="flex items-center justify-center text-xs text-gray-500 gap-1">
        <Lock className="w-3 h-3" />
        <span>Secured by Stripe • 256-bit encryption</span>
      </div>
    </form>
  );
}

export default function BookingFeePayment(props: BookingFeePaymentProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
}
```

### Step 5: API Route for Booking Fee
```typescript
// app/api/booking-fee/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createBookingFeePayment, createTestBooking } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check for test mode
    if (
      process.env.ENABLE_TEST_MODE === 'true' && 
      body.testBypass
    ) {
      const testPayment = createTestBooking(body);
      return NextResponse.json({
        clientSecret: testPayment.client_secret,
        paymentIntentId: testPayment.id,
      });
    }
    
    // Create real payment intent for $5 booking fee
    const paymentIntent = await createBookingFeePayment({
      bookingId: body.bookingId,
      clientEmail: body.email,
      clientName: body.clientName || 'Customer',
      serviceName: body.serviceName,
      servicePrice: body.servicePrice,
      appointmentDate: body.appointmentDate,
    });
    
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Booking fee payment failed:', error);
    return NextResponse.json(
      { error: 'Failed to process booking fee' },
      { status: 500 }
    );
  }
}
```

### Step 6: Update Booking Confirmation
```typescript
// components/booking/BookingConfirmation.tsx
export function BookingConfirmation({ booking }: { booking: any }) {
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-green-50 rounded-lg p-6 text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Booking Confirmed!
        </h2>
        <p className="text-gray-600">
          Your appointment is secured with the $5 booking fee
        </p>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            What's Next?
          </h3>
          
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-purple-600">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Check your email
                </p>
                <p className="text-sm text-gray-600">
                  We sent your booking details and receipt
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-purple-600">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Arrive on time
                </p>
                <p className="text-sm text-gray-600">
                  {booking.appointmentDate} at {booking.appointmentTime}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-purple-600">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Pay at the salon
                </p>
                <p className="text-sm text-gray-600">
                  Service price: ${booking.servicePrice}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Cash, Zelle, or salon's preferred payment method
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600">
              <span className="font-medium">Booking Fee Paid:</span> $5.00
            </p>
            <p className="text-xs text-gray-600 mt-1">
              <span className="font-medium">Receipt #:</span> {booking.paymentIntentId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 7: Database Schema
```typescript
// convex/schema.ts updates
export const bookings = defineTable({
  // ... existing fields ...
  
  // Booking fee payment
  bookingFeePaid: v.boolean(),
  bookingFeeAmount: v.number(), // Always 500 ($5.00)
  bookingFeePaymentId: v.optional(v.string()), // Stripe payment intent ID
  bookingFeePaidAt: v.optional(v.number()),
  
  // Service payment (tracked but not processed)
  servicePrice: v.number(),
  servicePaidAtSalon: v.optional(v.boolean()),
  servicePaidMethod: v.optional(v.string()), // 'cash', 'zelle', etc.
  
  // Test flags
  isTestBooking: v.optional(v.boolean()),
  testBypassUsed: v.optional(v.boolean()),
})

// Platform revenue tracking
export const platformRevenue = defineTable({
  bookingId: v.id('bookings'),
  amount: v.number(), // Always 500 ($5.00)
  stripePaymentIntentId: v.string(),
  collectedAt: v.number(),
  month: v.string(), // '2024-01'
  year: v.number(),
  isTest: v.optional(v.boolean()),
})
.index('by_month', ['month', 'year'])
.index('by_booking', ['bookingId'])
```

## Testing the Flow

### 1. Client Books Appointment:
- Selects service ($150 box braids)
- Sees: "Pay $5 booking fee now, $150 at salon"
- Pays $5 with card
- Gets confirmation email

### 2. Day of Appointment:
- Client arrives at salon
- Shows booking confirmation
- Pays $150 directly to salon (cash/Zelle)
- Service completed

### 3. Platform Revenue:
- $5 per booking goes to BraidPilot
- No handling of salon payments
- Simple, clean revenue model

## Benefits of This Model

1. **Simpler Implementation**: No Stripe Connect needed
2. **Lower Risk**: Platform doesn't handle large sums
3. **Salon Flexibility**: Salons keep their existing payment methods
4. **Clear Value**: $5 fee is clearly for the booking service
5. **Easier Compliance**: Less financial regulation to deal with

## Revenue Projections

With $5 booking fee only:
- 100 bookings/day = $500/day = $15,000/month
- 500 bookings/day = $2,500/day = $75,000/month
- 1000 bookings/day = $5,000/day = $150,000/month

This is pure platform revenue with no salon payment processing overhead.