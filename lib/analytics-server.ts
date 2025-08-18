/**
 * Server-side analytics utilities
 * This file is only for use in API routes and server components
 * DO NOT import this in client-side code
 */

import type { AnalyticsEvent } from './analytics';

/**
 * Track an event from the server side
 * This should only be used in API routes
 */
export async function trackServerEvent(
  event: AnalyticsEvent,
  properties?: Record<string, any>
) {
  // Only track in production
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return;
  }

  try {
    // Use fetch to send events to PostHog API directly
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'}/capture/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
          event,
          properties: {
            distinct_id: properties?.userId || 'anonymous',
            ...properties,
          },
          timestamp: new Date().toISOString(),
        }),
      }
    );

    if (!response.ok) {
      console.error('Failed to track server event:', response.statusText);
    }
  } catch (error) {
    console.error('Error tracking server event:', error);
  }
}

/**
 * Identify a user from the server side
 * This should only be used in API routes
 */
export async function identifyServerUser(
  userId: string,
  properties?: Record<string, any>
) {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'}/capture/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
          event: '$identify',
          properties: {
            distinct_id: userId,
            $set: properties,
          },
          timestamp: new Date().toISOString(),
        }),
      }
    );

    if (!response.ok) {
      console.error('Failed to identify server user:', response.statusText);
    }
  } catch (error) {
    console.error('Error identifying server user:', error);
  }
}