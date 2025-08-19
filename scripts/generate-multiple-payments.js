#!/usr/bin/env node

// Script to generate multiple test payments in Stripe
// This will create various payment scenarios for testing

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51RxP4kJRyaaamNk0PptQ0ZBVQZ596cQbwKR6jrL8hbTMm24gNSVW6U22SqnJfhafjUnILThzGoJe8WQNp11gtnZz00ThjDGxW7');

// Test data for various services
const testBookings = [
  {
    service: 'Knotless Braids',
    price: 220,
    size: 'Medium',
    length: 'Mid-Back',
    client: 'Sarah Johnson',
    email: 'sarah.johnson@test.com',
    time: '09:00'
  },
  {
    service: 'Box Braids',
    price: 180,
    size: 'Small',
    length: 'Shoulder',
    client: 'Maria Garcia',
    email: 'maria.garcia@test.com',
    time: '10:30'
  },
  {
    service: 'Goddess Locs',
    price: 250,
    size: 'Large',
    length: 'Waist',
    client: 'Ashley Williams',
    email: 'ashley.williams@test.com',
    time: '13:00'
  },
  {
    service: 'Senegalese Twists',
    price: 190,
    size: 'Medium',
    length: 'Mid-Back',
    client: 'Jennifer Brown',
    email: 'jennifer.brown@test.com',
    time: '14:30'
  },
  {
    service: 'Micro Braids',
    price: 300,
    size: 'Micro',
    length: 'Shoulder',
    client: 'Lisa Davis',
    email: 'lisa.davis@test.com',
    time: '16:00'
  },
  {
    service: 'Cornrows',
    price: 80,
    size: 'Standard',
    length: 'Scalp',
    client: 'Michelle Wilson',
    email: 'michelle.wilson@test.com',
    time: '11:00'
  },
  {
    service: 'Passion Twists',
    price: 200,
    size: 'Medium',
    length: 'Mid-Back',
    client: 'Nicole Martinez',
    email: 'nicole.martinez@test.com',
    time: '12:00'
  },
  {
    service: 'Faux Locs',
    price: 230,
    size: 'Large',
    length: 'Waist',
    client: 'Patricia Anderson',
    email: 'patricia.anderson@test.com',
    time: '15:30'
  },
  {
    service: 'Spring Twists',
    price: 170,
    size: 'Small',
    length: 'Shoulder',
    client: 'Karen Thomas',
    email: 'karen.thomas@test.com',
    time: '10:00'
  },
  {
    service: 'Marley Twists',
    price: 160,
    size: 'Medium',
    length: 'Mid-Back',
    client: 'Betty Jackson',
    email: 'betty.jackson@test.com',
    time: '11:30'
  }
];

async function generatePayments() {
  console.log('🎯 Generating Multiple Test Payments for BraidPilot\n');
  console.log('═'.repeat(60));
  
  const results = {
    successful: [],
    failed: [],
    total: 0
  };
  
  // Generate appointment date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const appointmentDate = tomorrow.toISOString().split('T')[0];
  
  for (const booking of testBookings) {
    try {
      console.log(`\n📝 Creating payment for ${booking.client}...`);
      console.log(`   Service: ${booking.service} ($${booking.price})`);
      
      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 500, // Always $5 booking fee
        currency: 'usd',
        description: `Booking fee for ${booking.service}`,
        receipt_email: booking.email,
        metadata: {
          bookingId: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          clientEmail: booking.email,
          clientName: booking.client,
          serviceName: booking.service,
          servicePrice: booking.price.toString(),
          serviceSize: booking.size,
          serviceLength: booking.length,
          salonName: 'Elite Braids & Beauty',
          salonId: 'salon_elite_123',
          appointmentDate: appointmentDate,
          appointmentTime: booking.time,
          feeType: 'booking_fee',
          platform: 'BraidPilot',
          testRun: 'true',
          generatedAt: new Date().toISOString()
        },
        statement_descriptor_suffix: 'BOOKING',
      });
      
      // Create payment method
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          token: 'tok_visa',
        },
        billing_details: {
          email: booking.email,
          name: booking.client,
        },
      });
      
      // Confirm payment
      const confirmedPayment = await stripe.paymentIntents.confirm(
        paymentIntent.id,
        {
          payment_method: paymentMethod.id,
          return_url: 'http://localhost:3000/booking-success',
        }
      );
      
      if (confirmedPayment.status === 'succeeded') {
        console.log(`   ✅ Payment successful - ID: ${paymentIntent.id}`);
        results.successful.push({
          id: paymentIntent.id,
          client: booking.client,
          service: booking.service,
          amount: 5
        });
      } else {
        console.log(`   ⚠️  Payment status: ${confirmedPayment.status}`);
      }
      
      results.total += 5;
      
      // Small delay between payments
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      results.failed.push({
        client: booking.client,
        error: error.message
      });
    }
  }
  
  // Display summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 PAYMENT GENERATION SUMMARY');
  console.log('═'.repeat(60));
  console.log(`\n✅ Successful Payments: ${results.successful.length}`);
  console.log(`❌ Failed Payments: ${results.failed.length}`);
  console.log(`💰 Total Platform Fees: $${results.total}.00`);
  
  console.log('\n📋 Successful Payments:');
  results.successful.forEach((payment, index) => {
    console.log(`   ${index + 1}. ${payment.client} - ${payment.service} - $${payment.amount}`);
    console.log(`      View: https://dashboard.stripe.com/test/payments/${payment.id}`);
  });
  
  if (results.failed.length > 0) {
    console.log('\n⚠️  Failed Payments:');
    results.failed.forEach((failure, index) => {
      console.log(`   ${index + 1}. ${failure.client}: ${failure.error}`);
    });
  }
  
  console.log('\n🔗 View All Payments in Stripe Dashboard:');
  console.log('   https://dashboard.stripe.com/test/payments');
  
  console.log('\n📈 Webhook Events:');
  console.log('   https://dashboard.stripe.com/test/webhooks/events');
  
  console.log('\n✨ Test data generation complete!');
  console.log('   These payments simulate real booking scenarios');
  console.log('   Each payment represents a $5 platform booking fee');
  console.log('   Service prices shown are for reference (paid at salon)');
}

// Run the script
generatePayments().catch(console.error);