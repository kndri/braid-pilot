import { NextRequest, NextResponse } from 'next/server';
import { createBookingFeePayment } from '@/lib/stripe';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication (optional - bookings can be made by guests)
    const { userId } = auth();
    
    const body = await request.json();
    
    const {
      bookingId,
      clientEmail,
      clientName,
      serviceName,
      servicePrice,
      salonName,
      appointmentDate,
      appointmentTime,
    } = body;

    // Validate required fields
    if (!bookingId || !clientEmail || !clientName || !serviceName || !salonName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create payment intent for $5 booking fee
    const paymentIntent = await createBookingFeePayment({
      bookingId,
      clientEmail,
      clientName,
      serviceName,
      servicePrice: servicePrice || 0,
      salonName,
      appointmentDate,
      appointmentTime,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
    });
  } catch (error) {
    console.error('Failed to create payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}