#!/usr/bin/env node

// This script creates and completes a test payment using Stripe's test API
// It will show up as a completed payment in your Stripe dashboard

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51RxP4kJRyaaamNk0PptQ0ZBVQZ596cQbwKR6jrL8hbTMm24gNSVW6U22SqnJfhafjUnILThzGoJe8WQNp11gtnZz00ThjDGxW7');

async function createAndCompleteTestPayment() {
  console.log('🚀 Creating and completing test payment...\n');
  
  try {
    // Step 1: Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 500, // $5.00 in cents
      currency: 'usd',
      description: 'Booking fee for Knotless Braids at Elite Braids & Beauty',
      receipt_email: 'test.customer@example.com',
      metadata: {
        bookingId: `test_booking_${Date.now()}`,
        clientEmail: 'test.customer@example.com',
        clientName: 'Test Customer',
        serviceName: 'Knotless Braids',
        servicePrice: '220',
        salonName: 'Elite Braids & Beauty',
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: '14:00',
        feeType: 'booking_fee',
        platform: 'BraidPilot',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    console.log('✅ Payment Intent Created');
    console.log('   ID:', paymentIntent.id);
    console.log('   Status:', paymentIntent.status);
    console.log('   Amount: $' + (paymentIntent.amount / 100).toFixed(2));
    
    // Step 2: Create a test payment method
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: 'tok_visa', // Stripe's test token for a Visa card
      },
      billing_details: {
        email: 'test.customer@example.com',
        name: 'Test Customer',
      },
    });
    
    console.log('\n✅ Payment Method Created');
    console.log('   ID:', paymentMethod.id);
    console.log('   Card: •••• 4242 (Visa)');
    
    // Step 3: Confirm the payment
    const confirmedPayment = await stripe.paymentIntents.confirm(
      paymentIntent.id,
      {
        payment_method: paymentMethod.id,
        return_url: 'https://example.com/booking-success', // Required for some payment methods
      }
    );
    
    console.log('\n✅ Payment Confirmed Successfully!');
    console.log('   Status:', confirmedPayment.status);
    console.log('   Payment ID:', confirmedPayment.id);
    
    // Step 4: Display results
    console.log('\n' + '═'.repeat(60));
    console.log('📊 PAYMENT COMPLETED - Check your Stripe Dashboard:');
    console.log('═'.repeat(60));
    console.log('\n🔗 View in Dashboard:');
    console.log(`   https://dashboard.stripe.com/test/payments/${paymentIntent.id}`);
    console.log('\n📧 Customer: test.customer@example.com');
    console.log('💰 Amount Paid: $5.00');
    console.log('📝 Service: Knotless Braids ($220 - to be paid at salon)');
    console.log('📅 Appointment: ' + new Date().toLocaleDateString() + ' at 2:00 PM');
    console.log('\n✨ This payment should now show as "Succeeded" in your Stripe dashboard!');
    
    // Create multiple payments for testing
    console.log('\n' + '═'.repeat(60));
    console.log('Creating additional test payments...');
    console.log('═'.repeat(60));
    
    const services = [
      { name: 'Box Braids', price: 180 },
      { name: 'Goddess Locs', price: 250 },
      { name: 'Senegalese Twists', price: 190 },
    ];
    
    for (const service of services) {
      const additionalPayment = await stripe.paymentIntents.create({
        amount: 500,
        currency: 'usd',
        description: `Booking fee for ${service.name}`,
        metadata: {
          serviceName: service.name,
          servicePrice: service.price.toString(),
          platform: 'BraidPilot',
        },
        payment_method_types: ['card'],
        confirm: true,
        payment_method_data: {
          type: 'card',
          card: {
            token: 'tok_visa',
          },
        },
        return_url: 'https://example.com/booking-success',
      });
      
      console.log(`✅ ${service.name}: $5.00 booking fee - ${additionalPayment.status}`);
    }
    
    console.log('\n🎉 All test payments created successfully!');
    console.log('📊 Total test payments created: 4');
    console.log('💵 Total platform fees collected: $20.00');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.log('\n⚠️  Make sure your Stripe secret key is correct in the script');
    }
  }
}

// Run the test
createAndCompleteTestPayment();