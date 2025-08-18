import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

const BOOKING_FEE = parseInt(process.env.PLATFORM_BOOKING_FEE || '500'); // $5.00 in cents

export interface CreateBookingPaymentParams {
  bookingId: string;
  clientEmail: string;
  clientName: string;
  serviceName: string;
  servicePrice: number; // Display only - client pays at salon
  salonName: string;
  appointmentDate: string;
  appointmentTime: string;
}

/**
 * Creates a payment intent for the $5 booking fee only
 * The service price is paid directly at the salon
 */
export async function createBookingFeePayment({
  bookingId,
  clientEmail,
  clientName,
  serviceName,
  servicePrice,
  salonName,
  appointmentDate,
  appointmentTime,
}: CreateBookingPaymentParams): Promise<Stripe.PaymentIntent> {
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: BOOKING_FEE, // Always $5 booking fee
    currency: 'usd',
    description: `Booking fee for ${serviceName} at ${salonName}`,
    receipt_email: clientEmail,
    metadata: {
      bookingId,
      clientEmail,
      clientName,
      serviceName,
      servicePrice: servicePrice.toString(),
      salonName,
      appointmentDate,
      appointmentTime,
      feeType: 'booking_fee',
      platform: 'BraidPilot',
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return paymentIntent;
}

/**
 * Retrieves a payment intent by ID
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Cancels a payment intent (for cancelled bookings)
 */
export async function cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.cancel(paymentIntentId);
}

/**
 * Creates a refund for a payment (if needed for cancellations within policy)
 */
export async function createRefund(paymentIntentId: string, reason?: string): Promise<Stripe.Refund> {
  return await stripe.refunds.create({
    payment_intent: paymentIntentId,
    reason: 'requested_by_customer',
    metadata: {
      cancellation_reason: reason || 'Customer requested cancellation',
    },
  });
}

/**
 * Validates webhook signature
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export default stripe;