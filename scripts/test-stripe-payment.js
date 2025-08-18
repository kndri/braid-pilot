#!/usr/bin/env node

// Quick script to test Stripe payment creation
// This will create a test payment in your Stripe dashboard

const http = require('http');

const testPaymentData = {
  bookingId: `test_booking_${Date.now()}`,
  clientEmail: 'test@example.com',
  clientName: 'Test Customer',
  serviceName: 'Knotless Braids',
  servicePrice: 220,
  salonName: 'Elite Braids & Beauty',
  appointmentDate: new Date().toISOString().split('T')[0],
  appointmentTime: '14:00'
};

const postData = JSON.stringify(testPaymentData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/stripe/create-payment-intent',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🚀 Creating test payment intent...');
console.log('📧 Customer:', testPaymentData.clientEmail);
console.log('💰 Booking Fee: $5.00');
console.log('🎨 Service:', testPaymentData.serviceName, `($${testPaymentData.servicePrice})`);

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (response.clientSecret) {
        console.log('\n✅ Payment Intent Created Successfully!');
        console.log('🔑 Payment Intent ID:', response.paymentIntentId);
        console.log('💳 Amount:', `$${response.amount / 100}`);
        console.log('\n📊 Check your Stripe Dashboard at:');
        console.log('   https://dashboard.stripe.com/test/payments');
        console.log('\nYou should see a $5.00 payment intent in "Incomplete" status');
      } else {
        console.error('❌ Error:', response.error || 'Unknown error');
      }
    } catch (e) {
      console.error('❌ Failed to parse response:', e.message);
      console.log('Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request failed:', e.message);
  console.log('\nMake sure the development server is running:');
  console.log('   npm run dev');
});

req.write(postData);
req.end();