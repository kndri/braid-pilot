'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { identifyUser, trackPageView } from '@/lib/analytics';
import { errorMonitor } from '@/lib/monitoring';
import { initPerformanceMonitoring } from '@/lib/performance';

function AnalyticsContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();

  // Initialize PostHog on client side
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      import('posthog-js').then((posthogModule) => {
        const posthog = posthogModule.default;
        
        // Initialize PostHog
        const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
        if (!posthogKey) {
          console.warn('PostHog key not found, analytics disabled');
          return;
        }
        posthog.init(posthogKey, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
          loaded: (posthog) => {
            if (process.env.NODE_ENV === 'development') {
              // Disable in development unless explicitly enabled
              if (!process.env.NEXT_PUBLIC_ENABLE_DEV_ANALYTICS) {
                posthog.opt_out_capturing();
              }
            }
            // Make posthog available globally
            (window as any).posthog = posthog;
          },
          autocapture: true,
          capture_pageview: false, // We'll handle this manually
          capture_pageleave: true,
          disable_session_recording: process.env.NODE_ENV === 'development',
        });
      });
    }
  }, []);

  // Initialize error monitoring and performance tracking
  useEffect(() => {
    errorMonitor.initialize();
    initPerformanceMonitoring();
  }, []);

  // Track page views
  useEffect(() => {
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      trackPageView(url, {
        referrer: document.referrer,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
      });
    }
  }, [pathname, searchParams]);

  // Identify user when authenticated
  useEffect(() => {
    if (isLoaded && user) {
      identifyUser(user.id, {
        email: user.emailAddresses[0]?.emailAddress,
        name: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      });
    }
  }, [isLoaded, user]);

  return <>{children}</>;
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <AnalyticsContent>{children}</AnalyticsContent>
    </Suspense>
  );
}