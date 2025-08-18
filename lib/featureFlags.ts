// Feature flags configuration for production
// These flags control which features are visible to users

export const FEATURE_FLAGS = {
  // Core features - ENABLED
  PRICE_MY_STYLE: true,
  BOOKING_PRO: true,
  BRAIDER_MANAGEMENT: true,
  DASHBOARD: true,
  CRM: true,
  
  // Beta features - DISABLED for production
  VIRTUAL_RECEPTIONIST: false,
  REPUTATION_MANAGEMENT: false,
  AI_AGENT: false,
  
  // Development features
  DEBUG_MODE: process.env.NODE_ENV === 'development',
  SHOW_TEST_DATA: process.env.NODE_ENV === 'development',
} as const;

// Helper function to check if a feature is enabled
export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  // Allow override via environment variables for testing
  const envOverride = process.env[`NEXT_PUBLIC_FEATURE_${feature}`];
  if (envOverride !== undefined) {
    return envOverride === 'true';
  }
  
  return FEATURE_FLAGS[feature];
}

// Export type for TypeScript
export type FeatureFlag = keyof typeof FEATURE_FLAGS;