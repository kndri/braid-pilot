/**
 * Analytics wrapper for PostHog
 * Provides a centralized way to track events and user properties
 */

// Client-side PostHog is initialized in AnalyticsProvider.tsx
// Server-side tracking should be done via API routes if needed

/**
 * Analytics event types
 */
export const ANALYTICS_EVENTS = {
  // Onboarding events
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',
  
  // Quote tool events
  QUOTE_STARTED: 'quote_started',
  QUOTE_COMPLETED: 'quote_completed',
  QUOTE_SHARED: 'quote_shared',
  QUOTE_BOOKED: 'quote_booked',
  
  // Booking events
  BOOKING_STARTED: 'booking_started',
  BOOKING_COMPLETED: 'booking_completed',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_RESCHEDULED: 'booking_rescheduled',
  BOOKING_NO_SHOW: 'booking_no_show',
  
  // Payment events
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_COMPLETED: 'payment_completed',
  PAYMENT_FAILED: 'payment_failed',
  
  // Dashboard events
  DASHBOARD_VIEWED: 'dashboard_viewed',
  FEATURE_CLICKED: 'feature_clicked',
  TOOL_COPIED: 'tool_copied',
  
  // Braider management
  BRAIDER_ADDED: 'braider_added',
  BRAIDER_UPDATED: 'braider_updated',
  BRAIDER_DEACTIVATED: 'braider_deactivated',
  
  // Settings events
  SETTINGS_UPDATED: 'settings_updated',
  TIMEZONE_CHANGED: 'timezone_changed',
  PRICING_UPDATED: 'pricing_updated',
  
  // Error events
  ERROR_OCCURRED: 'error_occurred',
  ERROR_BOUNDARY_TRIGGERED: 'error_boundary_triggered',
} as const;

export type AnalyticsEvent = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

/**
 * Track an analytics event
 */
export function trackEvent(
  event: AnalyticsEvent,
  properties?: Record<string, any>
) {
  // Skip in development unless explicitly enabled
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_ENABLE_DEV_ANALYTICS) {
    return;
  }
  
  // Client-side tracking only
  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.capture(event, properties);
  }
}

/**
 * Identify a user for analytics
 */
export function identifyUser(
  userId: string,
  properties?: Record<string, any>
) {
  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.identify(userId, properties);
  }
}

/**
 * Track page views
 */
export function trackPageView(
  path: string,
  properties?: Record<string, any>
) {
  trackEvent('$pageview' as AnalyticsEvent, {
    path,
    ...properties,
  });
}

/**
 * Track conversion funnel
 */
export function trackFunnelStep(
  funnel: string,
  step: number,
  stepName: string,
  properties?: Record<string, any>
) {
  trackEvent(`funnel_${funnel}_step_${step}` as AnalyticsEvent, {
    funnel,
    step,
    stepName,
    ...properties,
  });
}

/**
 * Track revenue events
 */
export function trackRevenue(
  amount: number,
  currency: string = 'USD',
  properties?: Record<string, any>
) {
  trackEvent('revenue' as AnalyticsEvent, {
    revenue: amount,
    currency,
    ...properties,
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(
  feature: string,
  action: string,
  properties?: Record<string, any>
) {
  trackEvent(ANALYTICS_EVENTS.FEATURE_CLICKED, {
    feature,
    action,
    ...properties,
  });
}

/**
 * Track errors for monitoring
 */
export function trackError(
  error: Error,
  context?: Record<string, any>
) {
  trackEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
    error_message: error.message,
    error_stack: error.stack,
    ...context,
  });
}