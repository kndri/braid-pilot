// Configuration and Feature Flags

export const config = {
  // Payment Configuration
  payment: {
    enabled: process.env.PAYMENT_ENABLED === 'true' || true, // Now enabled with Stripe
    bookingFeeAmount: 5, // $5 booking fee
    testMode: process.env.NODE_ENV === 'development',
  },
  
  // Platform Configuration
  platform: {
    name: 'BraidPilot',
    supportEmail: 'support@braidpilot.com',
    website: 'https://braidpilot.com',
  },
  
  // Feature Flags
  features: {
    paymentProcessing: false, // Enable when Stripe is ready
    virtualReceptionist: false,
    reputationManagement: false,
    smsNotifications: true,
    emailNotifications: true,
  },
  
  // Deployment Configuration
  deployment: {
    environment: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  },
};

// Helper to check if payment is required
export function isPaymentRequired(): boolean {
  return config.payment.enabled && !config.payment.testMode;
}

// Helper to check if in test mode
export function isTestMode(): boolean {
  return config.payment.testMode || !config.payment.enabled;
}