import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { constructWebhookEvent } from '@/lib/stripe';
import Stripe from 'stripe';

// Disable body parsing, we need the raw body for webhook verification
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature');
  
  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  
  let event: Stripe.Event;
  
  try {
    event = constructWebhookEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }
  
  // Handle the events
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        console.log('✅ Booking fee payment succeeded:', {
          id: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          bookingId: paymentIntent.metadata.bookingId,
          clientEmail: paymentIntent.metadata.clientEmail,
          serviceName: paymentIntent.metadata.serviceName,
        });
        
        // TODO: Update booking status in Convex
        // await updateBookingPaymentStatus({
        //   bookingId: paymentIntent.metadata.bookingId,
        //   paymentIntentId: paymentIntent.id,
        //   status: 'paid',
        // });
        
        // TODO: Send confirmation email
        // await sendBookingConfirmationEmail({
        //   email: paymentIntent.metadata.clientEmail,
        //   bookingId: paymentIntent.metadata.bookingId,
        // });
        
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        
        console.error('❌ Payment failed:', {
          id: failedPayment.id,
          bookingId: failedPayment.metadata.bookingId,
          error: failedPayment.last_payment_error?.message,
        });
        
        // TODO: Update booking status
        // await updateBookingPaymentStatus({
        //   bookingId: failedPayment.metadata.bookingId,
        //   status: 'payment_failed',
        // });
        
        break;
      }
      
      case 'payment_intent.canceled': {
        const canceledPayment = event.data.object as Stripe.PaymentIntent;
        
        console.log('🚫 Payment canceled:', {
          id: canceledPayment.id,
          bookingId: canceledPayment.metadata.bookingId,
        });
        
        break;
      }
      
      case 'charge.refunded': {
        const refund = event.data.object as Stripe.Charge;
        
        console.log('💰 Refund processed:', {
          id: refund.id,
          amount: refund.amount_refunded / 100,
          paymentIntent: refund.payment_intent,
        });
        
        // TODO: Update booking status to refunded
        // await updateBookingRefundStatus({
        //   paymentIntentId: refund.payment_intent as string,
        //   refundAmount: refund.amount_refunded,
        // });
        
        break;
      }
      
      default:
        console.log(`ℹ️ Unhandled webhook event: ${event.type}`);
    }
    
    return NextResponse.json({ 
      received: true,
      type: event.type 
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}