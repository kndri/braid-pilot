# Platform Fee Implementation Guide

## Overview
BraidPilot collects a $5 platform fee from each booking to sustain the platform. This fee is separate from the service price and goes directly to BraidPilot, not the salon.

## Architecture

### Payment Flow
1. **Client books service** → Sees service price + $5 platform fee
2. **Payment processing** → Stripe charges total amount
3. **Fee distribution**:
   - $5 goes to BraidPilot platform account
   - Service price goes to salon's connected account (minus Stripe fees)

## Implementation Steps

### Step 1: Environment Variables
Add to `.env.local`:
```bash
# Stripe Platform Configuration
STRIPE_SECRET_KEY=sk_live_xxx  # Your platform Stripe secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx  # Your platform public key
STRIPE_WEBHOOK_SECRET=whsec_xxx  # Webhook endpoint secret
STRIPE_CONNECT_CLIENT_ID=ca_xxx  # For onboarding salons

# Platform Fee Configuration
PLATFORM_FEE_AMOUNT=500  # $5.00 in cents
PLATFORM_NAME="BraidPilot"

# Test Mode Configuration
STRIPE_TEST_MODE=true  # Enable test mode
TEST_CARD_BYPASS=true  # Enable test card bypass
```

### Step 2: Test Cards for Development
Create a test card allowlist:
```typescript
// lib/testCards.ts
export const TEST_CARDS = {
  // Successful payment cards
  SUCCESS: {
    number: '4242424242424242',
    name: 'Test Success',
    exp: '12/34',
    cvc: '123'
  },
  SUCCESS_3D: {
    number: '4000002500003155',
    name: 'Test 3D Secure',
    exp: '12/34',
    cvc: '123'
  },
  
  // Failure cards
  DECLINE: {
    number: '4000000000000002',
    name: 'Test Decline',
    exp: '12/34',
    cvc: '123'
  },
  INSUFFICIENT_FUNDS: {
    number: '4000000000009995',
    name: 'Test Insufficient',
    exp: '12/34',
    cvc: '123'
  },
  
  // Special bypass cards (platform testing only)
  BYPASS_ADMIN: {
    number: '5555555555554444',  // Mastercard test
    name: 'Platform Admin',
    exp: '12/34',
    cvc: '123',
    bypass: true  // Skip actual charge
  },
  BYPASS_DEMO: {
    number: '378282246310005',  // Amex test
    name: 'Demo Account',
    exp: '12/34',
    cvc: '123',
    bypass: true  // Skip actual charge
  }
};

export function isTestCard(cardNumber: string): boolean {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  return Object.values(TEST_CARDS).some(
    card => card.number === cleanNumber
  );
}

export function shouldBypassPayment(cardNumber: string): boolean {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  const card = Object.values(TEST_CARDS).find(
    card => card.number === cleanNumber
  );
  return card?.bypass === true;
}
```

### Step 3: Stripe Service with Platform Fee
```typescript
// lib/stripe.ts
import Stripe from 'stripe';
import { shouldBypassPayment } from './testCards';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const PLATFORM_FEE = parseInt(process.env.PLATFORM_FEE_AMOUNT || '500'); // $5 in cents

export interface PaymentIntentData {
  serviceAmount: number;  // Service price in cents
  platformFee: number;    // Platform fee in cents ($5)
  totalAmount: number;    // Total to charge customer
  salonStripeAccountId?: string;  // Connected account ID
  clientEmail: string;
  serviceName: string;
  bookingId: string;
}

export async function createPaymentIntent(data: PaymentIntentData) {
  const { 
    serviceAmount, 
    salonStripeAccountId,
    clientEmail,
    serviceName,
    bookingId
  } = data;
  
  const totalAmount = serviceAmount + PLATFORM_FEE;
  
  // For connected accounts (when salon has Stripe Connect)
  if (salonStripeAccountId) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      application_fee_amount: PLATFORM_FEE,  // Platform keeps $5
      transfer_data: {
        destination: salonStripeAccountId,  // Rest goes to salon
      },
      metadata: {
        bookingId,
        clientEmail,
        serviceName,
        serviceAmount: serviceAmount.toString(),
        platformFee: PLATFORM_FEE.toString(),
      },
    });
    
    return paymentIntent;
  }
  
  // For non-connected salons (platform holds funds temporarily)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount,
    currency: 'usd',
    metadata: {
      bookingId,
      clientEmail,
      serviceName,
      serviceAmount: serviceAmount.toString(),
      platformFee: PLATFORM_FEE.toString(),
      requiresManualTransfer: 'true',  // Flag for manual payout
    },
  });
  
  return paymentIntent;
}

// Test mode payment bypass
export async function processTestPayment(data: PaymentIntentData) {
  // Simulate successful payment for test cards
  return {
    id: `pi_test_${Date.now()}`,
    status: 'succeeded',
    amount: data.totalAmount,
    client_secret: `test_secret_${Date.now()}`,
    metadata: {
      bookingId: data.bookingId,
      test: 'true',
      bypassCard: 'true',
    },
  };
}
```

### Step 4: Payment Component with Fee Display
```typescript
// components/booking/PaymentForm.tsx
'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { isTestCard, shouldBypassPayment, TEST_CARDS } from '@/lib/testCards';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const PLATFORM_FEE = 5; // $5 platform fee

interface PaymentFormProps {
  servicePrice: number;
  serviceName: string;
  bookingId: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

function CheckoutForm({ 
  servicePrice, 
  serviceName, 
  bookingId,
  onSuccess,
  onError 
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTestCards, setShowTestCards] = useState(false);
  
  const totalAmount = servicePrice + PLATFORM_FEE;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    setIsProcessing(true);
    
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;
    
    // Get card details to check for test bypass
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });
    
    if (error) {
      onError(error.message || 'Payment failed');
      setIsProcessing(false);
      return;
    }
    
    // Check if this is a bypass test card
    if (process.env.NEXT_PUBLIC_ENV === 'development') {
      const cardNumber = paymentMethod?.card?.last4;
      // For demo purposes, check if using test bypass cards
      if (shouldBypassPayment(cardNumber || '')) {
        console.log('Test card bypass activated');
        // Simulate successful payment without charging
        onSuccess(`test_${Date.now()}`);
        setIsProcessing(false);
        return;
      }
    }
    
    // Create payment intent on backend
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceAmount: servicePrice * 100, // Convert to cents
        bookingId,
        serviceName,
      }),
    });
    
    const { clientSecret } = await response.json();
    
    // Confirm payment
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod.id,
    });
    
    if (result.error) {
      onError(result.error.message || 'Payment failed');
    } else {
      onSuccess(result.paymentIntent.id);
    }
    
    setIsProcessing(false);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Price Breakdown */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>{serviceName}</span>
          <span>${servicePrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-orange-600">
          <span>Platform Booking Fee</span>
          <span>${PLATFORM_FEE.toFixed(2)}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-semibold">
          <span>Total</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          The $5 booking fee helps maintain the platform and provide 24/7 support.
        </p>
      </div>
      
      {/* Test Cards Helper (Dev Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <button
            type="button"
            onClick={() => setShowTestCards(!showTestCards)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showTestCards ? 'Hide' : 'Show'} Test Cards
          </button>
          
          {showTestCards && (
            <div className="mt-3 space-y-2 text-xs">
              <div className="font-medium text-gray-700">Regular Test Cards:</div>
              <div>✅ Success: 4242 4242 4242 4242</div>
              <div>❌ Decline: 4000 0000 0000 0002</div>
              
              <div className="font-medium text-gray-700 mt-2">Bypass Cards (No Charge):</div>
              <div>🎫 Admin: 5555 5555 5555 4444</div>
              <div>🎫 Demo: 3782 822463 10005</div>
            </div>
          )}
        </div>
      )}
      
      {/* Card Input */}
      <div className="border rounded-lg p-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      
      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : `Pay $${totalAmount.toFixed(2)}`}
      </button>
      
      {/* Security Badge */}
      <div className="flex items-center justify-center text-xs text-gray-500">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Secured by Stripe
      </div>
    </form>
  );
}

export default function PaymentForm(props: PaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
}
```

### Step 5: API Route for Payment Intent
```typescript
// app/api/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent, processTestPayment } from '@/lib/stripe';
import { shouldBypassPayment } from '@/lib/testCards';
import { auth } from '@clerk/nextjs';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    const body = await request.json();
    
    const {
      serviceAmount,
      bookingId,
      serviceName,
      clientEmail,
      testCard,
    } = body;
    
    // Check for test card bypass in development
    if (
      process.env.NODE_ENV === 'development' &&
      testCard &&
      shouldBypassPayment(testCard)
    ) {
      const testPayment = await processTestPayment({
        serviceAmount,
        platformFee: 500,
        totalAmount: serviceAmount + 500,
        clientEmail,
        serviceName,
        bookingId,
      });
      
      return NextResponse.json({
        clientSecret: testPayment.client_secret,
        paymentIntentId: testPayment.id,
        testMode: true,
      });
    }
    
    // Create real payment intent
    const paymentIntent = await createPaymentIntent({
      serviceAmount,
      platformFee: 500, // $5 platform fee
      totalAmount: serviceAmount + 500,
      clientEmail,
      serviceName,
      bookingId,
      // salonStripeAccountId: salon?.stripeAccountId, // If using Connect
    });
    
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Payment intent creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
```

### Step 6: Webhook Handler for Payment Confirmation
```typescript
// app/api/stripe-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Extract metadata
      const {
        bookingId,
        serviceAmount,
        platformFee,
        clientEmail,
      } = paymentIntent.metadata;
      
      // Update booking status in database
      // await updateBookingPaymentStatus(bookingId, 'paid', paymentIntent.id);
      
      // Record platform fee collection
      // await recordPlatformFee({
      //   amount: platformFee,
      //   bookingId,
      //   paymentIntentId: paymentIntent.id,
      // });
      
      console.log('Payment succeeded:', {
        bookingId,
        total: paymentIntent.amount / 100,
        platformFee: platformFee ? parseInt(platformFee) / 100 : 0,
        service: serviceAmount ? parseInt(serviceAmount) / 100 : 0,
      });
      
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.error('Payment failed:', failedPayment.id);
      // Handle failed payment
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  return NextResponse.json({ received: true });
}
```

### Step 7: Update Booking Flow
```typescript
// components/booking/BookingFlow.tsx
// Add payment step to booking flow

import PaymentForm from './PaymentForm';

function BookingPaymentStep({ 
  booking, 
  onComplete 
}: { 
  booking: any; 
  onComplete: () => void;
}) {
  const handlePaymentSuccess = async (paymentIntentId: string) => {
    // Update booking with payment info
    await updateBooking({
      bookingId: booking.id,
      paymentIntentId,
      paymentStatus: 'paid',
      platformFeePaid: true,
    });
    
    // Send confirmation email
    await sendBookingConfirmation({
      bookingId: booking.id,
      email: booking.clientEmail,
      includeReceipt: true,
    });
    
    onComplete();
  };
  
  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Complete Your Booking</h2>
      
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-800">
          Your appointment is reserved for the next 10 minutes. 
          Please complete payment to confirm your booking.
        </p>
      </div>
      
      <PaymentForm
        servicePrice={booking.servicePrice}
        serviceName={booking.serviceName}
        bookingId={booking.id}
        onSuccess={handlePaymentSuccess}
        onError={(error) => {
          console.error('Payment error:', error);
          // Show error message to user
        }}
      />
    </div>
  );
}
```

### Step 8: Database Schema Updates
```typescript
// convex/schema.ts
// Add payment tracking fields

export const bookings = defineTable({
  // ... existing fields ...
  
  // Payment Information
  paymentStatus: v.optional(v.union(
    v.literal('pending'),
    v.literal('paid'),
    v.literal('failed'),
    v.literal('refunded'),
    v.literal('test_bypass')
  )),
  paymentIntentId: v.optional(v.string()),
  platformFeePaid: v.optional(v.boolean()),
  platformFeeAmount: v.optional(v.number()), // In cents
  totalAmountPaid: v.optional(v.number()),   // In cents
  paymentMethod: v.optional(v.string()),      // Last 4 digits
  paymentDate: v.optional(v.number()),
  
  // Test mode flags
  isTestBooking: v.optional(v.boolean()),
  testCardUsed: v.optional(v.string()),
})

// Platform fee tracking table
export const platformFees = defineTable({
  bookingId: v.id('bookings'),
  amount: v.number(),        // In cents ($500 = $5.00)
  status: v.string(),         // 'collected', 'pending', 'failed'
  stripePaymentIntentId: v.optional(v.string()),
  collectedAt: v.number(),
  
  // Monthly aggregation
  month: v.string(),         // '2024-01'
  year: v.number(),
})
.index('by_month', ['month', 'year'])
.index('by_booking', ['bookingId'])
```

### Step 9: Admin Dashboard for Platform Fees
```typescript
// app/admin/platform-fees/page.tsx
'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function PlatformFeesPage() {
  const currentMonth = useQuery(api.platformFees.getCurrentMonthRevenue);
  const dailyRevenue = useQuery(api.platformFees.getDailyRevenue);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Platform Revenue</h1>
      
      {/* Monthly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500">Current Month</div>
          <div className="text-3xl font-bold text-green-600">
            ${(currentMonth?.total || 0) / 100}
          </div>
          <div className="text-sm text-gray-500">
            {currentMonth?.count || 0} bookings
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500">Average Fee</div>
          <div className="text-3xl font-bold">$5.00</div>
          <div className="text-sm text-gray-500">Per booking</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500">Test Bookings</div>
          <div className="text-3xl font-bold text-blue-600">
            {currentMonth?.testCount || 0}
          </div>
          <div className="text-sm text-gray-500">Not charged</div>
        </div>
      </div>
      
      {/* Daily Breakdown */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Daily Revenue</h2>
        </div>
        <div className="p-6">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500">
                <th className="pb-2">Date</th>
                <th className="pb-2">Bookings</th>
                <th className="pb-2">Platform Fees</th>
                <th className="pb-2">Test Bookings</th>
              </tr>
            </thead>
            <tbody>
              {dailyRevenue?.map((day) => (
                <tr key={day.date} className="border-t">
                  <td className="py-2">{day.date}</td>
                  <td className="py-2">{day.bookings}</td>
                  <td className="py-2 text-green-600">
                    ${(day.fees / 100).toFixed(2)}
                  </td>
                  <td className="py-2 text-blue-600">{day.testBookings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

## Testing Instructions

### 1. Test Card Scenarios

#### Success Flow:
```
Card: 4242 4242 4242 4242
Exp: 12/34
CVC: 123
Result: Payment succeeds, $5 fee collected
```

#### Bypass Flow (Admin Testing):
```
Card: 5555 5555 5555 4444
Exp: 12/34
CVC: 123
Result: Booking created, no charge, marked as test
```

#### Failure Flow:
```
Card: 4000 0000 0000 0002
Exp: 12/34
CVC: 123
Result: Payment declined, booking not confirmed
```

### 2. Integration Testing

1. **Create test booking**:
   - Service price: $100
   - Platform fee: $5
   - Total charge: $105

2. **Verify in Stripe Dashboard**:
   - Payment intent shows $105 total
   - Application fee is $5
   - Transfer amount is $100 (if using Connect)

3. **Check database**:
   - Booking has `platformFeePaid: true`
   - Platform fee record created
   - Payment status is 'paid'

### 3. Webhook Testing

Use Stripe CLI for local testing:
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Trigger test events
stripe trigger payment_intent.succeeded
```

## Production Checklist

- [ ] Set up production Stripe keys
- [ ] Configure webhook endpoint in Stripe Dashboard
- [ ] Enable Stripe Connect for salon onboarding
- [ ] Set up monitoring for failed payments
- [ ] Configure receipt emails
- [ ] Add refund handling
- [ ] Implement dispute management
- [ ] Set up financial reporting
- [ ] Add platform fee documentation for salons
- [ ] Create help center articles about the fee

## Revenue Projections

With a $5 platform fee:
- 100 bookings/day = $500/day = $15,000/month
- 500 bookings/day = $2,500/day = $75,000/month
- 1000 bookings/day = $5,000/day = $150,000/month

## Support Documentation

### For Clients:
"The $5 booking fee helps us maintain the platform, provide 24/7 support, and continuously improve your booking experience."

### For Salons:
"BraidPilot charges a $5 platform fee per booking. This fee is paid by the client and does not affect your service pricing or earnings."